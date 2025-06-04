import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: [
			{ find: /^#application\/(.*)/, replacement: resolve('src/core/application/$1.ts') },
			{ find: /^#domain\/(.*)/, replacement: resolve('src/core/domain/$1.ts') },
			{ find: /^#infrastructure\/(.*)/, replacement: resolve('src/core/infrastructure/$1.ts') },
			{
				find: '#lib',
				replacement: '#lib',
				customResolver(source) {
					if (source === '#lib/discord') return resolve('src/lib/discord/index.ts');
					if (source === '#lib/embeds') return resolve('src/lib/embeds/index.ts');
					if (source === '#lib/structures') return resolve('src/lib/structures/index.ts');
					if (source === '#lib/structures/managers') return resolve('src/lib/structures/managers/index.ts');
					if (source === '#lib/setup') return resolve('src/lib/setup/index.ts');
					if (source === '#lib/types') return resolve('src/lib/types/index.ts');
					if (source === '#lib/i18n/languageKeys') return resolve('src/lib/i18n/languageKeys/index.ts');
					return source.replace('#lib', resolve('src/lib'));
				}
			},
			{ find: /^#root\/(.*)/, replacement: resolve('src/$1.ts') },
			{ find: '#languages', replacement: resolve('src/languages/index.ts') },
			{
				find: '#utils',
				replacement: '#utils',
				customResolver(source) {
					if (source === '#utils/common') return resolve('src/lib/util/common/index.ts');
					if (source === '#utils/functions') return resolve('src/lib/util/functions/index.ts');
					if (source === '#utils/birthday') return resolve('src/lib/util/birthday/index.ts');
					return source.replace('#utils', resolve('src/lib/util'));
				}
			}
		]
	},
	test: {
		setupFiles: ['./tests/vitest.setup.ts'],
		globals: true
	},
	esbuild: {
		target: 'es2022'
	}
});
