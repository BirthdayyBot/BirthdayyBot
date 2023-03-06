# Base Stage
# Base Image
FROM node:19-alpine3.15 AS base

WORKDIR /home/node/app

# TODO: what if produduction?
ENV NODE_ENV="development"
# TO HAVE A CLEANER OUTPUT
ENV CI=true

# LEAVE THIS
RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories

# TODO: WTF Does this do
RUN apk add -u --no-cache \
    dumb-init \
    fontconfig \
    jq \
    python3 \
    nodejs \
    doppler \
    build-base \ 
g++

# TODO: What does this do
COPY --chown=node:node yarn.lock .
COPY --chown=node:node package.json .
COPY --chown=node:node .yarn/ .yarn/
COPY --chown=node:node .yarnrc.yml .

ENTRYPOINT [ "dumb-init", "--" ]

# Build Stage
FROM base AS builder

WORKDIR /home/node/app

ENV NODE_ENV="development"

COPY --chown=node:node tsconfig.json tsconfig.json

RUN yarn install --immutable

COPY --chown=node:node src/ src/
RUN yarn build

# Runner Stage
FROM base AS runner

WORKDIR /home/node/app

ENV NODE_ENV="production"

# COPY FROM PREVIOUS STAGE
COPY --chown=node:node --from=builder /home/node/app/dist dist

RUN yarn workspaces focus --all --production
RUN chown node:node /home/node/app

USER node

CMD [ "yarn", "start" ]
# docker build -t birthdayybot .
# docker run -d -e DOPPLER_TOKEN="YOUR_TOKEN" --name myawesomebot-optional birthday-bot:latest
# docker ps -a
# docker logs  3a --follow
# docker container prune
# docker image prune
