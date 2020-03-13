import Docker from 'dockerode';

const docker = new Docker();

export async function listImages({ reference }) {
  return await docker.listImages({
    all: false,
    filters: {
      reference: [reference]
    }
  });
}

export async function fetchImage({ auth, fromImage, tag }) {
  return new Promise((resolve, reject) => {
    docker.createImage(auth, { fromImage, tag }, (error, stream) => {
      if (error) return reject(error);

      stream.pipe(process.stdout);

      // stream.on('data', data => console.log(data.toString('utf8')));
      stream.on('end', resolve);
      stream.on('error', reject);
    });
  });
}

export async function createContainer({ image, options }) {
  // const docker = new Docker();
  return await docker.createContainer({
    ...options, // config[repo].options,
    Image: image //  `${fromImage}:${payload}`
  });
  // console.log('starting', { container });
  // await container.start();
}
