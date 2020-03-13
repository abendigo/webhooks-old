import Octokit from '@octokit/rest';
import chokidar from 'chokidar';
import crypto from 'crypto';
import Docker from 'dockerode';
import * as fs from 'fs';
import mysql from 'mysql';
import { createContainer, fetchImage, listImages } from './lib/docker.mjs';
import config from './config/config.json';
import secrets from './config/secrets.json';

console.log({ config, secrets });

async function query(connection, query, data = {}) {
  return new Promise((resolve, reject) => {
    connection.query(query, data, (error, response) => {
      if (error) reject(error);

      resolve(response);
    });
  });
}
async function onBeacon() {
  console.log('onBeacon', {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });

  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });

  let processed;
  do {
    const xx = await query(connection, 'START TRANSACTION');
    console.log('xx', xx);

    try {
      const [response] = await query(
        connection,
        `SELECT * FROM tasks WHERE status = 'queued' LIMIT 1 FOR UPDATE SKIP LOCKED`
      );

      // processed = response.length;
      if (response) {
        console.log(response.id, response.status);

        const params = JSON.parse(response.params);
        const headers = JSON.parse(response.headers);
        const body = JSON.parse(response.body);

        const { repo } = params;
        const {
          deployment: { id, payload },
          repository: {
            name,
            owner: { login }
          }
        } = body;

        ///////////////////////////////////////////////////////////////////////////////////////////

        console.log({ payload });
        const { tag, image } = JSON.parse(payload);
        console.log({ tag, image });

        const fromImage = `${config[repo].registry}/${config[repo].repository}/${image}`;
        console.log({ fromImage });

        let images = await listImages({ reference: `${fromImage}` });
        console.log({ images });

        if (images.length === 0) {
          await fetchImage({
            auth: {
              username: 'abendigo',
              password: secrets[repo].token
            },
            fromImage,
            tag
          });

          images = await listImages({ reference: `${fromImage}` });
          console.log({ images });
        }

        ///////////////////////////////////////////////////////////////////////////////////////////

        const docker = new Docker();
        const containers = await docker.listContainers({
          all: true

          // filters: { name: [name] }
        });
        console.log('containers', { containers });
        const filtered = containers.filter(({ Image: image }) =>
          image.startsWith(fromImage)
        );
        console.log({ filtered });

        ///////////////////////////////////////////////////////////////////////////////////////////

        const container = await createContainer({
          image: `${fromImage}:${tag}`,
          options: config[repo].images[image].options
        });

        // console.log({ container });
        container.start();

        ///////////////////////////////////////////////////////////////////////////////////////////

        ///////////////////////////////////////////////////////////////////////////////////////////

        // await query(
        //   connection,
        //   `UPDATE tasks SET status = 'deployed' where id = ?`,
        //   response.id
        // );
      }

      await query(connection, 'COMMIT');
    } catch (error) {
      console.log('error', error);
      await query(connection, 'ROLLBACK');
    }
  } while (processed > 0);

  connection.end();
}

chokidar.watch('beacon').on('change', onBeacon);
onBeacon();

async function fetchImageIfRequired({ auth, fromImage, tag }) {
  const docker = new Docker();

  const images = await docker.listImages({
    all: false,
    filters: {
      reference: [`${fromImage}:${tag}`]
    }
  });
  // console.log('images', images.length);
  // for (let image of images) {
  //   console.log('image', image.RepoTags);
  // }

  console.log('before images', images.length);
  if (images.length === 0) {
    // const auth = {
    //   username: 'abendigo',
    //   password: secrets[repo].token
    // };
    // console.log('inside', auth);

    await new Promise((resolve, reject) => {
      console.log('creating');
      docker.createImage(auth, { fromImage, tag }, (error, stream) => {
        if (error) return reject(error);

        // stream.on('data', data => console.log(data.toString('utf8')));
        stream.on('end', resolve);
        stream.on('error', reject);
      });
    });
    console.log('after promise');
  }
}

async function stopAndRemoveContainerIfExists(name) {
  console.log('stopAndRemoveContainerIfExists', name);

  const docker = new Docker();
  const containers = await docker.listContainers({
    all: true,
    filters: { name: [name] }
  });
  console.log('containers', { containers });

  if (containers && containers[0]) {
    console.log(
      containers[0].Names,
      containers[0].Labels,
      containers[0].HostConfig,
      containers[0].Mounts
    );
    const container = docker.getContainer(containers[0].Id);
    console.log('stopping');
    await container.stop().catch(error => console.log('stop', error));
    console.log('removing');
    await container.remove().catch(error => console.log('remove', error));
  }
}

async function attemptDeployment() {
  if (deploymentQueue.length > 0) {
    const { repo, id, payload, name, login } = deploymentQueue.pop();
    console.log('attemptDeployment', { repo, id, payload, name, login });

    const octokit = new Octokit.Octokit({
      auth: secrets[repo].token,
      userAgent: 'abendigo/webhooks/0.1.1'
    });

    // await octokit.repos
    //   .createDeploymentStatus({
    //     headers: { accept: 'application/vnd.github.flash-preview+json' },
    //     owner: login,
    //     repo: name,
    //     deployment_id: id,
    //     state: 'in_progress'
    //   })
    //   .catch(error => console.log('zzzzzzzz error', { error }));

    // const docker = new Docker({ socketPath: '/var/run/docker.sock' });
    // const docker = new Docker();
    const fromImage = `${config[repo].registry}/${config[repo].repository}/${config[repo].image}`;
    await fetchImageIfRequired({
      auth: {
        username: 'abendigo',
        password: secrets[repo].token
      },
      fromImage,
      tag: payload
    });
    /*
    const images = await docker.listImages({
      all: false,
      filters: {
        reference: [`${fromImage}:${payload}`]
      }
    });
    console.log('images', images.length);
    for (let image of images) {
      console.log('image', image.RepoTags);
    }

    console.log('before images');
    if (images.length === 0) {
      const auth = {
        username: 'abendigo',
        password: secrets[repo].token
      };
      console.log('inside', auth);

      await new Promise((resolve, reject) => {
        console.log('promise');
        docker.createImage(
          auth,
          { fromImage, tag: payload },
          (error, stream) => {
            if (error) return reject(error);

            // stream.on('data', data => console.log(data.toString('utf8')));
            stream.on('end', resolve);
            stream.on('error', reject);
          }
        );
      });
      console.log('after promise');
    }
*/
    console.log('before containers');

    await stopAndRemoveContainerIfExists(config[repo].options.name);
    /*
    const containers = await docker.listContainers({
      all: true,
      filters: {
        name: [config[repo].options.name]
      }
    });
    console.log('containers', { containers });

    if (containers && containers[0]) {
      console.log(
        containers[0].Names,
        containers[0].Labels,
        containers[0].HostConfig,
        containers[0].Mounts
      );
      const container = docker.getContainer(containers[0].Id);
      await container.stop().catch(error => console.log('stop', error));
      await container.remove().catch(error => console.log('remove', error));
    }
*/
    console.log('creating');

    const docker = new Docker();
    const container = await docker.createContainer({
      ...config[repo].options,
      Image: `${fromImage}:${payload}`
    });
    console.log('starting', { container });
    await container.start();
  }

  setTimeout(attemptDeployment, 5000);
}

// attemptDeployment();

async function queueDeployment({ body, params }) {
  const { repo } = params;
  console.log('======== queueDeployment');

  const {
    // deployment: { id, task, payload, environment, description },
    deployment: { id, payload },
    repository: {
      name,
      owner: { login }
    }
  } = body;

  const octokit = new Octokit.Octokit({
    auth: secrets[repo].token,
    userAgent: 'abendigo/webhooks/0.1.1'
  });

  deploymentQueue.push({ repo, id, payload, name, login });
  fs.appendFileSync(
    'jobqueue',
    JSON.stringify({ repo, id, payload, name, login }),
    'utf8'
  );

  // await octokit.repos
  //   .createDeploymentStatus({
  //     headers: { accept: 'application/vnd.github.flash-preview+json' },
  //     owner: login,
  //     repo: name,
  //     deployment_id: id,
  //     state: 'queued'
  //   })
  //   .catch(error => console.log('zzzzzzzz error', { error }));
}

async function deploy({ body, params }) {
  const { repo } = params;

  const {
    // deployment: { id, task, payload, environment, description },
    deployment: { id, payload },
    repository: {
      name,
      owner: { login }
    }
  } = body;

  const octokit = new Octokit({
    auth: secrets[repo].token,
    userAgent: 'abendigo/webhooks/0.1.1',
    log: console
    // log: {
    //   debug: log.debug.bind(log),
    //   info: log.info.bind(log),
    //   warn: () => {
    //     console.log('xxxx warn');
    //   },
    //   error: () => {
    //     console.log('xxxx error');
    //   }
    // }
  });

  // const docker = new Docker({ socketPath: '/var/run/docker.sock' });
  const docker = new Docker();
  const fromImage = `${config[repo].registry}/${config[repo].repository}/${config[repo].image}`;

  const images = await docker.listImages({
    all: false,
    filters: {
      reference: [`${fromImage}:${payload}`]
    }
  });
  // console.log('images', images.length);
  // for (let image of images) {
  //   console.log('image', image.RepoTags);
  // }
  if (images.length === 0) {
    const auth = {
      username: 'abendigo',
      password: secrets[repo].token
    };

    await new Promise((resolve, reject) => {
      docker.createImage(auth, { fromImage, tag: payload }, (error, stream) => {
        if (error) return reject(error);

        // stream.on('data', data => console.log(data.toString('utf8')));
        stream.on('end', resolve);
        stream.on('error', reject);
      });
    });
  }

  const containers = await docker.listContainers({
    all: true,
    filters: {
      name: [config[repo].options.name]
    }
  });
  // console.log('containers', { containers });

  if (containers && containers[0]) {
    const container = docker.getContainer(containers[0].Id);
    await container.stop().catch(error => console.log('stop', error));
    await container.remove();
  }

  const container = await docker.createContainer({
    ...config[repo].options,
    Image: `${fromImage}:${payload}`
  });
  // console.log({ container });
  await container.start();

  await octokit.repos
    .createDeploymentStatus({
      owner: login,
      repo: name,
      deployment_id: id,
      state: 'success'
    })
    .catch(error => console.log('zzzzzzzz error', { error }));

  console.log('======== finishing deploy');
}

// Using a single function to handle multiple signals
function handle(signal) {
  console.log(`Received ${signal}`);
}

process.on('SIGINT', handle);
process.on('SIGTERM', handle);
