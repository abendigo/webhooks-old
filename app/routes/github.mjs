import Octokit from '@octokit/rest';
import crypto from 'crypto';

import secrets from '../../secrets.json';

export const verify = (request, response, buffer, encoding) => {
  const { 'x-hub-signature': expected } = request.headers;
  const { repo } = request.params;

  if (!secrets[repo]) {
    throw new Error("Unexpected Repository.");
  }

  const sha1 = crypto
    .createHmac('sha1', secrets[repo].webhook)
    .update(buffer, encoding)
    .digest('hex');
  const signature = `sha1=${sha1}`;

  if (signature !== expected) {
    throw new Error("Invalid Signature.");
  }
}

export const handler = (request, response, next) => {
  const { 'x-github-event': event, 'x-github-delivery': delivery } = request.headers;
  const { repo } = request.params;

  console.log('===============', { event, delivery, repo });

  const octokit = new Octokit({
    auth: secrets[repo].token,
    userAgent: "abendigo/webhooks v0.1.1",
    log: console
  });

  switch (event) {
    case 'ping':
      break;

    case 'deployment':
      const { deployment: { id }, repository: { name, owner: { login } } } = request.body;
      console.log({ id, name, login });

      octokit.repos.createDeploymentStatus({
        owner: login,
        repo: name,
        deployment_id: is,
        state: 'success'
      });
      break;
  }

  response.end();
};
