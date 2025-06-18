import { Mocked } from 'vitest';
import type { UserRepository } from '../../../../../src/core/domain/user/ports/UserRepository.js';
import { UserService } from '../../../../../src/core/domain/user/services/UserService.js';

describe('UserService', () => {
	let repository: Mocked<UserRepository>;
	let service: UserService;

	beforeEach(() => {
		repository = {
			findById: vitest.fn(),
			create: vitest.fn(),
			update: vitest.fn(),
			delete: vitest.fn()
		};
		service = new UserService(repository);
	});

	describe('getUser', () => {
		it('should return user when found', async () => {
			const mockUser = { id: '123', premium: false };
			repository.findById.mockResolvedValue(mockUser);

			const result = await service.getUser('123');
			expect(result).toEqual(mockUser);
		});
	});

	describe('createUser', () => {
		it('should create user with given data', async () => {
			const input = { id: '123', premium: false };
			const mockUser = { ...input };
			repository.create.mockResolvedValue(mockUser);

			const result = await service.createUser(input);
			expect(result).toEqual(mockUser);
		});
	});
});
