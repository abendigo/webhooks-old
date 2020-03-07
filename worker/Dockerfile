# Largely copied from https://hackernoon.com/a-tale-of-two-docker-multi-stage-build-layers-85348a409c84
# and https://nodejs.org/de/docs/guides/nodejs-docker-webapp/
FROM node:12.13.0-alpine AS build

# because we are using alpine and it does not come with many build tools,
# we should install the node-gyp collection of tools.
RUN apk add --update --no-cache python make g++

WORKDIR /src

# Note that, rather than copying the entire working directory, we are only copying
# the package*.json file(s). This allows us to take advantage of cached Docker layers.
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# npm ci works similarly to npm i, but skips the expensive dependency resolution step,
# and instead just installs the exact dependencies specified in your package-lock.json file.
# It’s basically a faster npm i for use in CI environments.
RUN npm ci --production
# RUN npm ci

# Bundle app source
COPY . .

# RUN npm run lint
# RUN npm run test
# RUN npm run build

# get rid of any development dependencies as they are no longer needed past this point.
# RUN npm prune --production

# Thats it for the build side. Now, the deployable parts

FROM node:12.13.0-alpine

WORKDIR /usr/src/service

COPY --from=build /src/node_modules node_modules
# COPY --from=build /src/app app
COPY --from=build /src/*.mjs ./

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE $PORT

# USER node - Need ROOT to access /var/run/docker.sock
CMD ["npm", "start"]
