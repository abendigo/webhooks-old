# webhooks

node --experimental-modules .\index.mjs

docker run -it --rm -v /var/run/docker.sock:/var/run/docker.sock -v c:/Users/mark/dev:/data node bash


curl -X POST -d '{"a":"b"}' -H 'Content-Type: application/json' http://localhost:8080/github
