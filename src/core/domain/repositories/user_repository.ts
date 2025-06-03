import type { CreateUserData, User } from '#domain/entities/user';
import type { Repository, SingleIdRepository } from '#domain/repositories/base_repository';

/**
 * Repository interface for managing User entities
 */
export interface UserRepository extends SingleIdRepository<User> {
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
	 * Finds users who have birthdays in a specific guild
	 * @param guildId - The Discord guild ID
	 * @returns Array of users
	 */
	findUsersWithBirthdaysInGuild(guildId: string): Promise<User[]>;

	/**
	 * Updates premium status for a user
	 * @param userId - The Discord user ID
	 * @param isPremium - The premium status to set
	 * @returns The updated user
	 */
	updatePremiumStatus(userId: string, isPremium: boolean): Promise<User>;

	/**
	 * Finds or creates a user
	 * @param userId - The Discord user ID
	 * @param defaultData - Default data to use if user needs to be created
	 * @returns The found or created user
	 */
	findOrCreate(userId: string, defaultData: Omit<CreateUserData, 'id'>): Promise<User>;

	/**
	 * Creates a new user
	 * @param data - The user data
	 * @returns The created user
	 */
	create(data: Repository.CreateData<User>): Promise<User>;

	/**
	 * Updates a user
	 * @param userId - The Discord user ID
	 * @param data - The data to update
	 * @returns The updated user
	 */
	update(userId: string, data: Repository.UpdateData<User>): Promise<User>;

	/**
	 * Counts users by premium status
	 * @param premiumOnly - Whether to count only premium users
	 * @returns The count of users
	 */
	countByPremiumStatus(premiumOnly: boolean): Promise<number>;
}
