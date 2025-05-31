import { Entity } from '#lib/core/domain/entity';

interface Properties {
	userId: string;
	guildId: string;
	birthday: string; // Format: 'XXXX-MM-DD' or 'YYYY-MM-DD'
	createdAt: Date;
	updatedAt: Date;
}

export class Birthday extends Entity<Properties> {
	/**
	 * Formats the birthday in 'YYYY-MM-DD' or 'XXXX-MM-DD' format.
	 * If the year is 2000 or 'XXXX', it will be replaced with 'XXXX'.
	 */
	public formatBirthday(): string {
		const [year, month, day] = this.props.birthday.split('-');
		const formattedYear = year === '2000' || year === 'XXXX' ? 'XXXX' : year;
		return `${formattedYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
	}

	/**
	 * Returns the birthday as a Date object.
	 * If the year is 'XXXX', returns a Date with year 2000.
	 */
	public getDate(): Date {
		const [year, month, day] = this.props.birthday.split('-');
		const safeYear = year === 'XXXX' ? '2000' : year;
		return new Date(`${safeYear}-${month}-${day}`);
	}

	/**
	 * Checks if the birthday is today (ignores year).
	 */
	public isToday(): boolean {
		const today = new Date();
		const birthdayDate = this.getDate();
		return today.getDate() === birthdayDate.getDate() && today.getMonth() === birthdayDate.getMonth();
	}

	public static create(properties: Properties): Birthday {
		return new this(properties);
	}
}
