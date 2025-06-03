import type { User } from '#domain/entities/user/user';
import type { BaseRepository } from './base_repository.js';

/**
 * Repository interface for managing User entities
 */
export interface UserRepository extends BaseRepository<User> {
	/**
	 * Finds a user by Discord username
	 * @param username - The Discord username
	 * @returns The user if found, null otherwise
	 */
	findByUsername(username: string): Promise<User | null>;

	/**
	 * Finds all premium users
	 * @returns Array of premium users
	 */
	findPremiumUsers(): Promise<User[]>;

	/**
	 * Counts users by premium status
	 * @param premiumOnly - Whether to count only premium users
	 * @returns The count of users
	 */
	countByPremiumStatus(premiumOnly: boolean): Promise<number>;
}
