# Setup (Local dev)

This guide starts BirthdayyBot locally using **Podman** for containers and **Doppler** for environment variables.

## Prerequisites

- Node.js **22**
- Yarn **4.x** (repo uses Yarn 4)
- Doppler CLI (`doppler`)
- Podman (`podman`)

## Podman

Podman is the Docker Desktop alternative used for local containers (PostgreSQL, Redis, optional InfluxDB).

### Start the Podman VM (macOS)

```bash
podman machine init
podman machine start
```

If the VM already exists, `init` will error; that’s fine—just run `podman machine start`.

## Start local services (PostgreSQL + Redis)

From the repo root:

```bash
podman compose up -d postgres redis
```

What this starts (from `docker-compose.yml`):

- **Postgres**: `localhost:5432`, user `postgres`, password `postgres`, db `birthdayy`
- **Redis**: `localhost:8287`, password `redis`

Optional (only if you want analytics locally):

```bash
podman compose up -d influx
```

## Doppler

The bot is started with Doppler (`yarn start` runs via `doppler run ...`), so you need Doppler working locally.

### Install / verify Doppler

```bash
doppler --version
doppler login
```

### Select the right Doppler project/config

This repo uses `doppler.yaml` to pick the Doppler project/config. For local dev we use `dev_local`.

To verify what the CLI will use in this folder:

```bash
doppler configure --print-config
```

If you need to switch configs for this folder:

```bash
doppler configure set config dev_local
```

### Set required secrets for local containers

These values match the `docker-compose.yml` ports/credentials:

```bash
doppler secrets set \
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/birthdayy" \
  DIRECT_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/birthdayy" \
  REDIS_HOST="localhost" \
  REDIS_PORT="8287" \
  REDIS_PASSWORD="redis" \
  REDIS_DB="0"
```

Also make sure your config has at least:

- `DISCORD_TOKEN` (required)
- `CLIENT_ID`, `CLIENT_NAME`, `CLIENT_VERSION`, `CLIENT_OWNERS`

## Prisma (database migrations)

After Postgres is running and Doppler has `DATABASE_URL`/`DIRECT_DATABASE_URL` set:

```bash
doppler run -- yarn prisma:migrate
```

## Install deps + run the bot

```bash
yarn install
doppler run -- yarn dev
```

`yarn dev` = build + start. It will keep running until you stop it.

## Troubleshooting

### Postgres not reachable

- Check containers: `podman ps`
- Make sure `postgres` shows healthy and port `5432` is mapped.

### Redis auth/connection errors (BullMQ)

- Ensure Doppler variables match compose: `REDIS_PORT=8287` and `REDIS_PASSWORD=redis`

### Prisma complains about missing `DIRECT_DATABASE_URL`

- Add it in Doppler (it’s referenced by `prisma/schema.prisma`).

### Reset local containers (clean DB)

```bash
podman compose down -v
podman compose up -d postgres redis
```
