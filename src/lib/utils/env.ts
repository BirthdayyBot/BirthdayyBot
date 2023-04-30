import type { Env, EnvString } from '@skyra/env-utilities';

export function envIs<T extends EnvString>(key: T, value: Env[T]): boolean {
	return process.env[key] === value;
}
