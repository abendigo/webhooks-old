import Octokit from '@octokit/rest';
import crypto from 'crypto';

import Docker from 'dockerode';

import config from '../../config/config.json';
import secrets from '../../config/secrets.json';

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
    userAgent: 'abendigo/webhooks/0.1.1'
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

export const verify = (request, response, buffer, encoding) => {
  const { 'x-hub-signature': expected } = request.headers;
  const { repo } = request.params;

  if (!secrets[repo]) {
    throw new Error('Unexpected Repository.');
  }

  const sha1 = crypto
    .createHmac('sha1', secrets[repo].webhook)
    .update(buffer, encoding)
    .digest('hex');
  const signature = `sha1=${sha1}`;

  if (signature !== expected) {
    throw new Error('Invalid Signature.');
  }
};

export const handler = async (request, response /*, next */) => {
  const {
    'x-github-event': event
    // 'x-github-delivery': delivery
  } = request.headers;

  // console.log('111111 event', { event });

  switch (event) {
    case 'ping':
      break;

    case 'deployment':
      // Start the process, but don't wait for it to finish
      deploy(request);
      break;
  }

  response.end();
};
