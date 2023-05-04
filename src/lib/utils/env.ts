import type { Env, EnvString } from '@skyra/env-utilities';
import { IS_CUSTOM_BOT } from '../../helpers';

export function envIs<T extends EnvString>(key: T, value: Env[T]): boolean {
	return process.env[key] === value;
}

export const isDev = envIs('APP_ENV', 'dev');
export const isTst = envIs('APP_ENV', 'tst');
export const isPrd = envIs('APP_ENV', 'prd');

export const isDevelopment = isDev || isTst;
export const isProduction = isPrd && !IS_CUSTOM_BOT;
