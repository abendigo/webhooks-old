import Octokit from '@octokit/rest';
import crypto from 'crypto';

import Docker from 'dockerode';

import config from '../../config.json';
import secrets from '../../secrets.json';

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
    'x-github-event': event,
    'x-github-delivery': delivery
  } = request.headers;
  const { repo } = request.params;

  console.log('===============', {
    event,
    delivery,
    repo,
    secrets: secrets[repo],
    config: config[repo]
  });

  const octokit = new Octokit({
    auth: secrets[repo].token,
    userAgent: 'abendigo/webhooks/0.1.1',
    log: console
  });

  switch (event) {
    case 'ping':
      break;

    case 'deployment':
      {
        const {
          deployment: { id, task, payload, environment, description },
          repository: {
            name,
            owner: { login }
          }
        } = request.body;
        console.log({
          id,
          task,
          payload,
          environment,
          description,
          name,
          login
        });

        // const docker = new Docker({ socketPath: '/var/run/docker.sock' });
        const docker = new Docker();

        const images = await docker.listImages({
          all: false,
          filters: {
            reference: [payload]
          }
        });
        console.log('images', images.length);
        for (let image of images) {
          console.log('image', image.RepoTags);
        }
        if (images.length === 0) {
          const auth = {
            username: 'abendigo',
            password: secrets[repo].token
          };
          // await docker.pull(payload, { authconfig: auth });

          await docker.createImage();

          console.log('pulled');
        }

        const containers = await docker.listContainers({
          all: true,
          filters: {
            name: [config[repo].name]
          }
        });
        console.log('containers', { containers });

        if (containers && containers[0]) {
          const container = docker.getContainer(containers[0].Id);
          await container.stop().catch(error => console.log('stop', error));
          await container.remove();
        }

        const container = await docker.createContainer({
          ...config[repo],
          Image: payload
        });
        console.log({ container });
        await container.start();

        // await octokit.repos
        //   .createDeploymentStatus({
        //     owner: login,
        //     repo: name,
        //     deployment_id: id,
        //     state: 'success'
        //   })
        //   .catch(error => console.log(error));
      }
      break;
  }

  response.end();
};
