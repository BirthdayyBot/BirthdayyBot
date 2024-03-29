import { envParseBoolean, type Env, type EnvString } from '@skyra/env-utilities';

export function envIs<T extends EnvString>(key: T, value: Env[T]): boolean {
	return process.env[key] === value;
}

export const isDev = envIs('APP_ENV', 'dev');
export const isTst = envIs('APP_ENV', 'tst');
export const isPrd = envIs('APP_ENV', 'prd');

export const isCustom = envParseBoolean('CUSTOM_BOT');
export const isNotCustom = !isCustom;
export const isDevelopment = isDev || isTst;
export const isProduction = isPrd && isNotCustom;
