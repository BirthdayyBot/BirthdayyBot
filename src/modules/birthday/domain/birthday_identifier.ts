import { Identifier } from '../../core/domain/identifier.js';

export const BIRTHDAY_IDENTIFIER_TYPE = 'BirthdayIdentifier';
/**
 * Identifier for a birthday, composed of a guild ID and a user ID.
 */
export class BirthdayIdentifier extends Identifier<typeof BIRTHDAY_IDENTIFIER_TYPE> {
	public constructor(userId: string, guildId: string) {
		super({ value: BirthdayIdentifier.composeValue(userId, guildId) });
	}

	/**
	 * Return this user's ID.
	 */
	public get userId(): string {
		return this.props.value.split(':')[1];
	}

	/**
	 * Return this guild's ID.
	 */
	public get guildId(): string {
		return this.props.value.split(':')[0];
	}

	/**
	 * Create a BirthdayIdentifier from a guild ID and a user ID.
	 */
	public static fromStrings(guildId: string, userId: string): BirthdayIdentifier {
		return new BirthdayIdentifier(userId, guildId);
	}

	/**
	 * Create a BirthdayIdentifier from a string value in the format "guildId:userId".
	 */
	public static fromValue(value: string): BirthdayIdentifier {
		const [guildId, userId] = value.split(':');
		return new BirthdayIdentifier(userId, guildId);
	}

	/**
	 * Compose a value string from a user ID and a guild ID.
	 */
	private static composeValue(userId: string, guildId: string): string {
		return `${guildId}:${userId}`;
	}
}
