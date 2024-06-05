// Config must be the first to be loaded, as it sets the env:
import 'reflect-metadata';
import '#root/config';

// Import everything else:
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-hmr/register';
import '@sapphire/plugin-i18next/register';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-scheduled-tasks/register';
import '@sapphire/plugin-subcommands/register';
import '@sapphire/plugin-utilities-store/register';

// Setup files
import '#lib/setup/application-registries';
import '#lib/setup/inspect';
import '#lib/setup/prisma';
