import Docker from 'dockerode';

const foo = async () => {
  const docker = new Docker();

  const fromImage = 'docker.pkg.github.com/abendigo/myslots.club/myslots.club';
  // const tag = '0.1.0-5-g3c93476';
  // const tag = '0.1.0-4-g75156df';
  const tag = '0.1.0-3';

  // const list = await docker.listContainers({
  //   all: true
  //   // filters: {
  //   //   name: ['myslots.club']
  //   // }
  // });
  // console.log(list);

  const images = await docker.listImages({
    all: false
    // filters: {
    //   reference: [`${fromImage}:${tag}`]
    // }
  });
  console.log('images', images.length);
  for (let image of images) {
    console.log('image', image.RepoTags);
  }

  // docker.listImages().then(list => console.log(list));

  const auth = {
    username: 'abendigo',
    password: '015868a1f2f2507f1baee7ed35d7862348db9014'
  };

  // pullImage(image = 'node', version = 'latest') {
  //   this.imageName = `${image}:${version}`;
  //   log.debug(`=> Pulling ${this.imageName}`);
  //   return new Promise((resolve, reject) => {
  //     this.docker.pull(this.imageName, (err, stream) => {
  //       let message = '';
  //       if(err) return reject(err);
  //       stream.on('data', data => message += data);
  //       stream.on('end', () => resolve(message));
  //       stream.on('error', err => reject(err));
  //     });
  //   });
  // }

  // const stream = await client.pull(`${imageName}:${tag}`, {})
  // stream.on('data', log.debug)
  // stream.on('end', () => log.info(`End pulling ${imageName}:${tag}`))

  // docker.pull(`${fromImage}:${tag}`, { authconfig: auth }, (error, stream) => {
  //   docker.modem.followProgress(stream, onFinished, onProgress);

  //   function onFinished(err, output) {
  //     //output is an array with output json parsed objects
  //     //...
  //     console.log('finished', err);
  //   }
  //   function onProgress(event) {
  //     //...
  //     console.log('progress', event);
  //   }
  // });

  // const stream = await docker.pull(`${fromImage}:${tag}`, { authconfig: auth });
  // console.log(pulled);

  await new Promise((resolve, reject) => {
    docker.createImage(auth, { fromImage, tag }, (error, stream) => {
      if (error) return reject(error);

      // stream.on('data', data => console.log(data.toString('utf8')));
      stream.on('end', resolve); //console.log(`End pulling ${fromImage}:${tag}`));
      stream.on('error', reject);
    });
  });
};

foo();
