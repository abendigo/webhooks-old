import Octokit from '@octokit/rest';
import crypto from 'crypto';
import * as fs from 'fs';
import mysql from 'mysql';

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});
connection.connect(err => {
  if (err) throw err;
  console.log('Connected!');
});
// console.log('connection', connection);

// import low from 'lowdb';
// import FileSync from 'lowdb/adapters/FileSync';

// const adapter = new FileSync('db.json');
// const db = low(adapter);

import secrets from '../../config/secrets.json';

async function query(connection, query, data) {
  return new Promise((resolve, reject) => {
    connection.query(query, data, (error, response) => {
      if (error) reject(error);

      resolve(response);
    });
  });
}

async function queueDeployment({ body, headers, params }) {
  const { repo } = params;
  const {
    deployment: { id },
    repository: {
      name,
      owner: { login }
    }
  } = body;

  // Save the deetails to the database, so the worker knows what to do
  await query(connection, 'INSERT INTO tasks SET ?', {
    body: JSON.stringify(body),
    headers: JSON.stringify(headers),
    params: JSON.stringify(params)
  });

  // Tell GitHub that the deployment is queued
  const octokit = new Octokit.Octokit({
    auth: secrets[repo].token,
    userAgent: 'abendigo/webhooks/0.1.1'
  });

  await octokit.repos
    .createDeploymentStatus({
      headers: { accept: 'application/vnd.github.flash-preview+json' },
      owner: login,
      repo: name,
      deployment_id: id,
      state: 'queued'
    })
    .catch(error => console.log('zzzzzzzz error', { error }));

  // Notify the workers that there is work to do
  fs.writeFileSync('beacon', `${id}`, 'utf8');
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
  const { 'x-github-event': event } = request.headers;

  switch (event) {
    case 'ping':
      break;

    case 'deployment':
      await queueDeployment(request);
      break;
  }

  response.end();
};
