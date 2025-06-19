import { Mocked } from 'vitest';
import { BirthdayRepository } from '../../../../../src/core/domain/birthday/ports/BirthdayRepository.js';
import { BirthdayService } from '../../../../../src/core/domain/birthday/services/BirthdayService.js';

describe('BirthdayService', () => {
	let repository: Mocked<BirthdayRepository>;
	let service: BirthdayService;

	beforeEach(() => {
		repository = {
			findById: vitest.fn(),
			findByDate: vitest.fn(),
			findByGuild: vitest.fn(),
			create: vitest.fn(),
			update: vitest.fn(),
			delete: vitest.fn()
		};
		service = new BirthdayService(repository);
	});

	describe('setBirthday', () => {
		it('should create new birthday if not exists', async () => {
			const input = {
				userId: '123',
				guildId: '456',
				birthday: '2000-01-01'
			};
			repository.findById.mockResolvedValue(null);
			repository.create.mockResolvedValue({ ...input, disabled: false });

			const result = await service.setBirthday(input);
			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(repository.create).toHaveBeenCalledWith(input);
			expect(result.birthday).toBe(input.birthday);
		});
	});

	describe('getTodayBirthdays', () => {
		it('should return birthdays for given date', async () => {
			const mockBirthdays = [{ userId: '123', guildId: '456', birthday: '2000-01-01', disabled: false }];
			repository.findByDate.mockResolvedValue(mockBirthdays);

			const result = await service.getTodayBirthdays('01-01');
			expect(result).toEqual(mockBirthdays);
		});
	});
});
