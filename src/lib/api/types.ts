import type { ApiRequest as ApiRequestSapphire } from '@sapphire/plugin-api';

type RecordsQuery = Record<string, string | string[]>;
type RecordsParams = Record<string, string>;

export declare class ApiRequest<T extends RecordsQuery = never, U extends RecordsParams = never> extends ApiRequestSapphire {
	public override query: T;
	public override params: U;
}

export interface GuildQuery {
	guildId: string;
}

export type GuildAndUserQuery = GuildQuery & {
	userId: string;
};

export type BirthdayQuery = GuildQuery & {
	userId: string;
	username: string;
	discriminator: string;
	date: string;
};
