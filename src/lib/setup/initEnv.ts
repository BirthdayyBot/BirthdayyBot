import { join } from 'path';
import dotenv from 'dotenv';

// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';
const ROOT_DIR = join(__dirname, '..', '..', '..');
const SRC_DIR = join(ROOT_DIR, 'src');

let initEnv: any;
// require('dotenv-vault-core').config(join(SRC_DIR, '.env.vault'));
if (process.env.NODE_ENV) {
	initEnv = dotenv.config({ path: join(SRC_DIR, `.env.${process.env.NODE_ENV}`), override: true });
} else {
	initEnv = dotenv.config({ path: join(SRC_DIR, `.env`), override: true });
}
if (initEnv.error) {
	throw initEnv.error;
}
console.log('initEnv', initEnv);
