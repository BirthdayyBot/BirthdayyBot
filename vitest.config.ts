import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: [
			{
				find: '#utils',
				replacement: '#utils',
				customResolver(source) {
					if (source === '#utils/birthday') return resolve('src/lib/util/birthday/index.ts');
					if (source === '#utils/common') return resolve('src/lib/util/common/index.ts');
					if (source === '#utils/functions') return resolve('src/lib/util/functions/index.ts');
					return source.replace('#utils', resolve('src/lib/util'));
				}
			},
			{
				find: '#lib',
				replacement: '#lib',
				customResolver(source) {
					if (source === '#lib/discord') return resolve('src/lib/discord/index.ts');
					if (source === '#lib/embeds') return resolve('src/lib/embeds/index.ts');
					if (source === '#lib/structures/managers') return resolve('src/lib/structures/managers/index.ts');
					if (source === '#lib/structures') return resolve('src/lib/structures/index.ts');
					if (source === '#lib/setup') return resolve('src/lib/setup/index.ts');
					if (source === '#lib/types') return resolve('src/lib/types/index.ts');
					return source.replace('#lib', resolve('src/lib'));
				}
			},
			{ find: '#languages', replacement: resolve('src/languages/index.ts') },
			{ find: /^#root\/(.*)/, replacement: resolve('src/$1.ts') }
		]
	},
	test: {
		setupFiles: ['./tests/vitest.setup.ts'],
		globals: true,
		coverage: {
			// reporter: ['text', 'lcov', 'cobertura'],
			// include: ['src/lib/**']
		}
	},
	esbuild: {
		target: 'es2022'
	}
});
