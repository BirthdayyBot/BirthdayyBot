import { Entity } from '#root/modules/core/domain/entity';
import type { UserIdentifier } from './user_identifier.js';

interface Properties {
	id: UserIdentifier;
	username: string | null;
	discriminator: string | null;
	premium: boolean;
	createdAt: Date;
	updateAt: Date;
}

export class User extends Entity<Properties> {
	public get isPremium() {
		return this.props.premium;
	}

	public static create(properties: Properties) {
		return new this(properties);
	}
}
