import { Entity } from '#lib/core/domain/entity';

interface Properties {
	id: string;
	username?: string;
	discriminator?: string;
	premium: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export class User extends Entity<Properties> {
	/**
	 * Returns the full username in the format "username#discriminator".
	 */
	public getFullUsername(): string {
		return `${this.props.username}#${this.props.discriminator}`;
	}

	/**
	 * Checks if the user has premium status.
	 * @returns True if the user has premium, false otherwise.
	 */
	public hasPremium(): boolean {
		return this.props.premium;
	}

	public static create(properties: Properties): User {
		return new this(properties);
	}
}
