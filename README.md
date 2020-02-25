﻿# webhooks

node --experimental-modules .\index.mjs

docker run -it --rm -v /var/run/docker.sock:/var/run/docker.sock -v c:/Users/mark/dev:/data node bash
docker run --rm -p 8080:8080 -v /var/run/docker.sock:/var/run/docker.sock -v c:/Users/mark/dev/webhooks:/data node cd data && npm run dev


curl -X POST -d '{"a":"b"}' -H 'Content-Type: application/json' http://localhost:8080/github

ngrok http 8080
