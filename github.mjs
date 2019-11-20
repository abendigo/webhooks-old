import crypto from 'crypto';

const secrets = {
  'myslots.club': 'MY_GITHUB_WEBHOOK_SECRET',
  webhooks: 'MY_GITHUB_WEBHOOK_SECRET'
};

export const verify = (request, response, buffer, encoding) => {
  const { 'x-hub-signature': expected } = request.headers;
  const { repo } = request.params;

  const sha1 = crypto
    .createHmac('sha1', secrets[repo])
    .update(buffer, encoding)
    .digest('hex');
  const signature = `sha1=${sha1}`;

  if (signature !== expected) {
    throw new Error("Invalid signature.");
  }
}

export const handler = (request, response, next) => {
  const { 'x-github-event': event, 'x-github-delivery': delivery } = request.headers;
  console.log('===============', { event, delivery });
  response.end();
};
