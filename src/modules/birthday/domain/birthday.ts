import type {
	BIRTHDAY_IDENTIFIER_TYPE,
	BirthdayIdentifier
} from '#root/modules/birthday/domain/birthday_identifier.js';
import { Entity } from '#root/modules/core/domain/entity.js';

interface Properties {
	id: BirthdayIdentifier;
	birthday: string; // format: YYYY-MM-DD or XXXX-MM-DD
	disabled: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export class Birthday extends Entity<typeof BIRTHDAY_IDENTIFIER_TYPE, Properties> {
	public getBirthday(): string {
		return this.props.birthday;
	}

	public isDisabled(): boolean {
		return this.props.disabled;
	}

	public static create(properties: Properties) {
		return new this(properties);
	}
}
