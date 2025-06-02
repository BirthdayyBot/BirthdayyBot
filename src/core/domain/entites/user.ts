import type { Birthday } from '#root/core/domain/entites/birthday';

export interface User {
	id: string;
	username?: string;
	discriminator?: string;
	premium: boolean;
	createdAt?: Date;
	updatedAt?: Date;

	birthday?: Birthday[];
}
