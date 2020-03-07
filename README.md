# webhooks

![Server](https://github.com/abendigo/webhooks/workflows/Server/badge.svg?branch=master)
![Worker](https://github.com/abendigo/webhooks/workflows/Worker/badge.svg?branch=master)

node --experimental-modules .\index.mjs

docker run -it --rm -v /var/run/docker.sock:/var/run/docker.sock -v c:/Users/mark/dev:/data node bash
docker run --rm -p 8080:8080 -v /var/run/docker.sock:/var/run/docker.sock -v c:/Users/mark/dev/webhooks:/data node cd data && npm run dev

curl -X POST -d '{"a":"b"}' -H 'Content-Type: application/json' http://localhost:8080/github

ngrok http 8080

docker run --name webhooks -it --rm -v /var/run/docker.sock:/var/run/docker.sock -v c:/Users/mark/dev/webhooks/config:/usr/src/service/config docker.pkg.github.com/abendigo/webhooks/webhooks:0.2.2-2-g129b838

docker run --name mysql -e MYSQL_ROOT_PASSWORD=password -d mysql

docker exec knex_db_1 mysqldump -d -uwebhooks -ppassword webhooks

CREATE USER 'nativeuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';

CREATE USER 'webhooks'@'%' IDENTIFIED BY 'password';
GRANT ALL ON webhooks.\* TO 'webhooks'@'%';

mysql -uroot -pMyNewPass
