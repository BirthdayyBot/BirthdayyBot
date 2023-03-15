import type { ApiRequest as ApiRequestSapphire } from '@sapphire/plugin-api';

type RecordsQuery = Record<string, string | string[]>;
type RecordsParams = Record<string, string>;

export declare class ApiRequest<T extends RecordsQuery = never, U extends RecordsParams = never> extends ApiRequestSapphire {
	override query: T;
	override params: U;
}

export type GuildQuery = {
	guild_id: string;
};

export type GuildAndUserQuery = GuildQuery & {
	user_id: string;
};

export type BirthdayQuery = GuildQuery & {
	user_id: string;
	username: string;
	discriminator: string;
	date: string;
};
