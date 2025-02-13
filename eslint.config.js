import sapphireEslintConfig from '@sapphire/eslint-config';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat();

export default [
	{
		ignores: ['node_modules/**', 'dist/**']
	},
	...compat.config(sapphireEslintConfig),
	{
		rules: {
			'@typescript-eslint/no-base-to-string': 'off',
			'@typescript-eslint/no-throw-literal': 'off',
			'no-catch-shadow': 'off'
		},
		languageOptions: {
			parserOptions: {
				warnOnUnsupportedTypeScriptVersion: false
			}
		}
	},
	{
		files: ['src/commands/**/*.ts'],
		rules: {
			'@typescript-eslint/require-await': 'off'
		}
	}
];
