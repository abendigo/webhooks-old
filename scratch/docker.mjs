import Docker from 'dockerode';

const docker = new Docker({socketPath: '/var/run/docker.sock'});

docker.listContainers().then(list => {
  console.log(list);

  // const nginx = docker.getContainer(list[0].Id)
  // nginx.stop(() => console.log('done'));
});

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

// docker.createContainer({
//   Image: 'nginx',
//   name: 'nginx'
// }).then(container => {
//   return container.start();
// }).catch(error => console.log('oops', error));

/*
-l traefik.http.routers.myslots.rule="Host(\`myslots.club\`)" \
-l traefik.http.routers.myslots.entrypoints=http \
-l traefik.http.routers.myslots.middlewares=redirect@file \
-l traefik.http.routers.myslots-secured.rule="Host(\`myslots.club\`)" \
-l traefik.http.routers.myslots-secured.entrypoints=https \
-l traefik.http.routers.myslots-secured.tls=true \
-l traefik.http.routers.myslots-secured.tls.certResolver=sample \
-l traefik.enable=true \
--network web \
--name myslots.club \
*/
const slots = {
  HostConfig: {
    NetworkMode: 'web'
  },
  Labels: {
    'traefik.http.routers.myslots.rule': "Host(\`myslots.club\`)",
    'traefik.http.routers.myslots.entrypoints': 'http',
    'traefik.http.routers.myslots.middlewares': 'redirect@file',
    'traefik.http.routers.myslots-secured.rule': "Host(\`myslots.club\`)",
    'traefik.http.routers.myslots-secured.entrypoints': 'https',
    'traefik.http.routers.myslots-secured.tls': 'true',
    'traefik.http.routers.myslots-secured.tls.certResolver': 'sample',
    'traefik.enable': 'true'
  }
};

async function foo() {
  const container = await docker.createContainer({
    Image: 'nginx',
    name: 'nginx'
  });

  await container.start();
}

// foo();
