import type { GuildConfigRepository } from '../../../../../src/core/domain/guild/ports/GuildConfigRepository.js';
import { GuildConfigService } from '../../../../../src/core/domain/guild/services/GuildConfigService.js';

import { Mocked } from 'vitest';

describe('GuildConfigService', () => {
	let repository: Mocked<GuildConfigRepository>;
	let service: GuildConfigService;

	beforeEach(() => {
		repository = {
			findById: vitest.fn(),
			findMany: vitest.fn(),
			create: vitest.fn(),
			update: vitest.fn(),
			delete: vitest.fn(),
			setDisabled: vitest.fn()
		};
		service = new GuildConfigService(repository);
	});

	describe('getGuildConfig', () => {
		it('should return guild config when found', async () => {
			const mockConfig = {
				id: '123',
				timezone: 'UTC',
				premium: false,
				language: 'en',
				disabled: false
			};
			repository.findById.mockResolvedValue(mockConfig);

			const result = await service.getGuildConfig('123');
			expect(result).toEqual(mockConfig);
		});
	});

	describe('setGuildDisabled', () => {
		it('should update guild disabled state', async () => {
			const mockConfig = {
				id: '123',
				disabled: true,
				timezone: 'UTC',
				premium: false,
				language: 'en'
			};
			repository.setDisabled.mockResolvedValue(mockConfig);

			const result = await service.setGuildDisabled('123', true);
			expect(result.disabled).toBe(true);
		});
	});
});
