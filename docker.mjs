import Docker from 'dockerode';

const docker = new Docker({socketPath: '/var/run/docker.sock'});

// docker.listContainers().then(list => console.log(list));

// docker.listImages().then(list => console.log(list));

const auth = {
  username: 'abendigo',
  password: '---',
};
// docker.pull(
//   'docker.pkg.github.com/abendigo/myslots.club/myslots.club:e8de9a8aa078ba3aa090e11415ac24fb16cb3284',
//   {authconfig: auth}
// )
//   .then(success => console.log(success))
//   .then(undefined, error => console.log(error));
// 'docker.pkg.github.com/abendigo/myslots.club/myslots.club:e8de9a8aa078ba3aa090e11415ac24fb16cb3284',

// docker.run(
//   'nginx',
//   [], [],
//   {
//     Labels: {

//     }
//   }
// )
// .then(success => console.log('success'))
// .catch(error => console.log('error:', error));

docker.createContainer({
  Image: 'nginx',
  name: 'nginx'
}).then(container => {
  return container.start();
}).catch(error => console.log('oops', error));
