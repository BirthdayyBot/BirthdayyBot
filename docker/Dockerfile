FROM node:18.16.1-alpine AS base
WORKDIR /app

ENV HUSKY=0
ENV CI=true

RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
    apk add --no-cache dumb-init python3 g++ make doppler

COPY --chown=node:node yarn.lock .
COPY --chown=node:node package.json .
COPY --chown=node:node .yarnrc.yml .
COPY --chown=node:node .yarn/ .yarn/

RUN sed -i 's/"postinstall": "husky install .github\/husky"/"postinstall": ""/' ./package.json

ENTRYPOINT ["dumb-init", "--"]

FROM base AS builder

ENV NODE_ENV="development"

COPY --chown=node:node tsconfig.json .
COPY --chown=node:node ./src ./src
COPY --chown=node:node ./prisma ./prisma

RUN yarn install --immutable

RUN npx prisma generate
RUN npx tsc

FROM base AS production

ENV NODE_ENV="production"
# NOTE: max_old_space_size is intentionally set to 6144 MB to avoid Node.js out-of-memory errors
# under production workloads. Ensure that runtime environments allocate sufficient memory
# (e.g., container/host limits) and coordinate any changes here with capacity planning.
ENV NODE_OPTIONS="--enable-source-maps --max_old_space_size=6144"

COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/node_modules/@prisma/client/ ./node_modules/@prisma/client/
COPY --chown=node:node --from=builder /app/node_modules/.prisma/client/ ./node_modules/.prisma/client/

RUN yarn workspaces focus --all --production && \
    chown node:node /app/

ENV NODE_ENV=production

EXPOSE 4000

ENTRYPOINT ["doppler", "run", "--"]
CMD ["node", "dist/index.js"]
