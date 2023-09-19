// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import '@devtomio/plugin-botlist/register';
import '@kaname-png/plugin-sentry';
import '@kaname-png/plugin-sentry/register';
import '@kaname-png/plugin-influxdb/register';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-editable-commands/register';
import '@sapphire/plugin-hmr/register';
import '@sapphire/plugin-i18next/register';
import '@sapphire/plugin-subcommands/register';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-scheduled-tasks/register';
import '@sapphire/plugin-utilities-store/register';
import '@sentry/tracing';
import 'reflect-metadata';

import { ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import * as colorette from 'colorette';
import { inspect } from 'util';

// Set default inspection depth
inspect.defaultOptions.depth = 1;

// Enable colorette
colorette.createColors({ useColor: true });

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
