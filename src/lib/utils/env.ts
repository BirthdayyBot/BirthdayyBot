import { type Env, type EnvString, envParseBoolean } from '@skyra/env-utilities';

export function envIs<T extends EnvString>(key: T, value: Env[T]): boolean {
	return process.env[key] === value;
}

export const isProduction = envIs('NODE_ENV', 'production');
export const isDevelopment = envIs('NODE_ENV', 'development');
export const isTest = envIs('NODE_ENV', 'test');

export const isCustom = isProduction && envParseBoolean('CUSTOM_BOT');
