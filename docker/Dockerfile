FROM node:18.19.0-alpine as base
WORKDIR /app

ENV YARN_DISABLE_GIT_HOOKS=1
ENV CI=true

RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
    apk add --no-cache dumb-init python3 g++ make doppler

COPY --chown=node:node yarn.lock .
COPY --chown=node:node package.json .
COPY --chown=node:node .yarnrc.yml .
COPY --chown=node:node .yarn/ .yarn/

ENTRYPOINT ["dumb-init", "--"]

FROM base as builder

ENV NODE_ENV="development"

COPY --chown=node:node tsconfig.base.json .
COPY --chown=node:node ./src ./src
COPY --chown=node:node ./prisma ./prisma

RUN yarn install --immutable

RUN npx prisma generate
RUN npx tsc -b src

FROM base as production

ENV NODE_ENV="production"
ENV NODE_OPTIONS="--enable-source-maps --max_old_space_size=4096"

COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/node_modules/@prisma/client/ ./node_modules/@prisma/client/
COPY --chown=node:node --from=builder /app/node_modules/.prisma/client/ ./node_modules/.prisma/client/

RUN yarn workspaces focus --all --production
RUN chown node:node /app/

ENV NODE_ENV=production

EXPOSE 4000

ENTRYPOINT ["doppler", "run", "--"]
CMD node dist/index.js
