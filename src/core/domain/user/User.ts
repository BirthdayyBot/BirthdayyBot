export interface User {
	id: string;
	username?: string | null;
	discriminator?: string | null;
	premium: boolean;
}

export interface UserCreateInput {
	id: string;
	username?: string;
	discriminator?: string;
	premium?: boolean;
}

export interface UserUpdateInput extends Partial<UserCreateInput> {}
