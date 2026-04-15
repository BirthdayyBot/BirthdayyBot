# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

BirthdayyBot is a Discord bot built on the Sapphire Framework that manages server members' birthdays. It sends automatic birthday messages, manages birthday roles, and handles reminders across multiple Discord guilds with timezone support.

## Development Commands

### Build & Run

- `yarn build` - Compile TypeScript to JavaScript (outputs to `dist/`)
- `yarn dev` - Build and start the bot
- `yarn start` - Start the bot with Doppler (requires `DOPPLER_TOKEN` env var)
- `yarn watch` - Watch mode for TypeScript compilation
- `yarn watch:start` - Watch and auto-restart on changes

### Testing

- `yarn test` - Run tests with Vitest
- `yarn test:watch` - Run tests in watch mode
- `yarn test:coverage` - Run tests with coverage report

### Code Quality

- `yarn lint` - Lint and fix TypeScript files
- `yarn format` - Format code with Prettier

### Database

- `yarn prisma:generate` - Generate Prisma client
- `yarn prisma:migrate` - Run database migrations

### Docker Development

- `docker-compose up` - Start development services (PostgreSQL, Redis, InfluxDB, MySQL)
- The bot requires Doppler for configuration: set `DOPPLER_TOKEN` env var before running

## Architecture

### Framework & Core Structure

- **Sapphire Framework**: A Discord.js extension with plugin architecture
- **Entry Point**: `src/index.ts` initializes `BirthdayyClient` and connects to database
- **Configuration**: `src/config.ts` contains all environment-based setup (API, i18n, Discord client options)
- **Setup**: `src/lib/setup/index.ts` registers all Sapphire plugins (API, HMR, i18n, logger, scheduled tasks, subcommands)

### Custom Client Extensions

The bot extends `SapphireClient` as `BirthdayyClient` (in `src/lib/BirthdayyClient.ts`) with:

- Analytics integration (InfluxDB)
- Custom webhooks for errors and logs
- Guild member fetch queue
- Language fetching per guild

### Database Layer

- **ORM**: Prisma with PostgreSQL (transitioning from MySQL)
- **Schema**: `prisma/schema.prisma` defines models: `Birthday`, `Guild`, `User`, `Premium`, `Tiers`
- **Access**: Available via `container.prisma` throughout the codebase

### Key Manager Classes

Located in `src/lib/structures/managers/`:

1. **BirthdaysManager** (`BirthdaysManager.ts`)
    - Extends `Collection<string, Birthday>`
    - Manages birthday CRUD operations for a specific guild
    - Handles birthday announcements and role assignments
    - Methods: `findTodayBirthday()`, `announcedBirthday()`, `sendPaginatedBirthdays()`, etc.

2. **SettingsManager** (`SettingsManager.ts`)
    - Manages per-guild configuration
    - Stores settings like announcement channels, messages, roles, timezone, language
    - Access via `guild.settings` or `getBirthdays(guild).settings`

### Command Structure

Commands are organized in `src/commands/` by category:

- **Birthday/**: Core birthday commands (`birthday.ts`, `admin-birthday.ts`)
- **General/**: Info, ping, guide commands
- **Admin/**: Administrative commands
- **Tools/**: Utility commands (vote, count)
- **Owners/**: Owner-only commands

Commands extend `BirthdayyCommand` or `BirthdayySubcommand` from `src/lib/structures/commands/`. Subcommands use the `@subcommands` decorator with named handlers.

### Scheduled Tasks

Located in `src/scheduled-tasks/`:

- **BirthdayReminderTask.ts**: Runs hourly (`0 * * * *`) to announce birthdays across timezones
- **RemoveBirthdayRole.ts**: Removes birthday roles after the day ends
- **PostStats.ts**: Posts bot statistics
- **DisplayStats.ts**: Updates bot presence with stats
- **CleanDatabaseTask.ts**: Database cleanup
- **SyncResourceAnalytics.ts**: Syncs analytics data
- **VoteReminder.ts**: Reminds users to vote

Tasks extend Sapphire's `ScheduledTask` and use cron patterns for scheduling.

### Listeners

Located in `src/listeners/` and organized by event type:

- **guilds/**: Guild join/leave events
- **commands/**: Command success/error/denied events
- **errors/**: Error handling
- **analytics/**: Analytics event tracking
- **shard/**: Shard lifecycle events
- **ready.ts**: Bot ready event

### Utilities & Helpers

Located in `src/lib/util/`:

- **birthday/**: Birthday parsing, formatting, validation
- **common/**: Date utilities, timezone handling
- **functions/**: Guild/user utilities, promise helpers

Utilities are accessible via custom import aliases (see Import Aliases section).

### Import Aliases

The codebase uses TypeScript import aliases defined in `package.json` imports field:

- `#utils/birthday` → `./dist/lib/util/birthday/index.js`
- `#utils/common` → `./dist/lib/util/common/index.js`
- `#utils/functions` → `./dist/lib/util/functions/index.js`
- `#utils/*` → `./dist/lib/util/*.js`
- `#lib/discord` → `./dist/lib/discord/index.js`
- `#lib/structures` → `./dist/lib/structures/index.js`
- `#lib/setup` → `./dist/lib/setup/index.js`
- `#languages` → `./dist/languages/index.js`
- `#root/*` → `./dist/*.js`

These are also configured in `vitest.config.ts` for tests.

### Internationalization (i18n)

- Managed via Sapphire's i18n plugin
- Language files in `src/languages/`
- Default language: `en-US`
- Per-guild language settings stored in database
- Use `resolveKey(interaction, 'key', options)` to fetch translations
- Access via `container.i18n.getT(locale)` or `fetchT(guild)`

### API Layer

Optional API server (Sapphire plugin-api):

- Routes in `src/routes/`
- Enabled via `API_ENABLED` env var
- OAuth2 authentication support
- Default port: 3000

### Analytics

Optional InfluxDB integration:

- Enabled via `INFLUX_ENABLED` env var
- `AnalyticsData` class in `src/lib/structures/AnalyticsData.ts`
- Tracks bot metrics and events
- Access via `container.client.analytics`

## Configuration Management

The bot uses **Doppler** for environment variable management. Configuration template is in `doppler-template.yaml` with environments:

- `dev` (Development)
- `test` (Testing)
- `prd` (Production)

Key environment variables:

- `DISCORD_TOKEN`: Bot token
- `DATABASE_URL`: PostgreSQL connection string
- `CLIENT_ID`, `CLIENT_NAME`, `CLIENT_VERSION`: Bot identity
- `CLIENT_OWNERS`: Space-separated owner user IDs
- `INFLUX_*`: InfluxDB settings (optional)
- `REDIS_*`: Redis settings for BullMQ
- `SENTRY_DSN`: Error tracking (optional)
- `NODE_ENV`: `development` | `test` | `production`

## Development Notes

### Working with Birthdays

- Birthday format in database: `MM-DD` or `YYYY-MM-DD` string
- Use utilities in `#utils/birthday` for parsing/formatting
- Timezone handling uses `dayjs` with timezone plugin
- Each guild can have its own timezone setting

### Adding New Commands

1. Create file in appropriate `src/commands/` subdirectory
2. Extend `BirthdayyCommand` or `BirthdayySubcommand`
3. Use `@ApplyOptions` decorator for command options
4. Register command with `registerApplicationCommands()`
5. Use `applyDescriptionLocalizedBuilder()` for i18n support

### Database Changes

1. Modify `prisma/schema.prisma`
2. Run `yarn prisma:migrate` to create and apply migration
3. Run `yarn prisma:generate` to update Prisma client
4. Restart the bot (HMR may not pick up schema changes)

### Testing Strategy

- Unit tests in `tests/unit/`
- Vitest configuration in `vitest.config.ts`
- Import aliases are configured for test environment
- Mock Prisma client as needed for database-dependent tests

### Error Handling

- Sentry integration for production error tracking
- Custom webhooks for error/log messages (`WEBHOOK_ERROR`, `WEBHOOK_LOG`)
- Use `resolveOnErrorCodesDiscord()` utility for Discord API errors
- Result pattern available via `@sapphire/framework` for error handling

### Sapphire Container Access

Throughout the codebase, use `container` from `@sapphire/framework` or `@sapphire/pieces` to access:

- `container.client`: The Discord client
- `container.prisma`: Database client
- `container.logger`: Logger instance
- `container.i18n`: Internationalization
- `container.utilities`: Custom utilities (registered in setup)

## Node.js Version

This project requires **Node.js 22** (specified in package.json `engines` and `volta` fields). Use Yarn 4.9.2 as the package manager.
