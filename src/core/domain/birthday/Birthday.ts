export interface Birthday {
	userId: string;
	guildId: string;
	birthday: string;
	disabled: boolean;
}

export interface BirthdayCreateInput {
	userId: string;
	guildId: string;
	birthday: string;
}

export interface BirthdayUpdateInput {
	birthday?: string;
	disabled?: boolean;
}
