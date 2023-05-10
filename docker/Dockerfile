FROM node:18.16.0-alpine as base
WORKDIR /app

RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
    apk add doppler

COPY --chown=node:node package.json yarn.lock ./
COPY --chown=node:node tsconfig.json ./

FROM base as builder

RUN yarn install

COPY --chown=node:node ./src ./src
COPY --chown=node:node ./prisma ./prisma

RUN npx prisma generate
RUN npx tsc

FROM base as production

RUN yarn install --immutable

COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/node_modules/@prisma/client/ ./node_modules/@prisma/client/
COPY --chown=node:node --from=builder /app/node_modules/.prisma/client/ ./node_modules/.prisma/client/

ENV NODE_ENV=production

EXPOSE 4000

ENTRYPOINT ["doppler", "run", "--"]
CMD node dist/index.js
