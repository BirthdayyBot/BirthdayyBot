import type { LoginData } from '@sapphire/plugin-api';
import type { FlattenedGuild, FlattenedUser } from './ApiTransformers.js';

export interface PartialOauthFlattenedGuild extends Omit<FlattenedGuild, 'joinedTimestamp' | 'ownerId' | 'features'> {
	joinedTimestamp: FlattenedGuild['joinedTimestamp'] | null;
	ownerId: FlattenedGuild['ownerId'] | null;
}

export interface OauthFlattenedGuild extends PartialOauthFlattenedGuild {
	permissions: string;
	manageable: boolean;
	isBotAdded: boolean;
}

export interface OauthFlattenedUser {
	user: FlattenedUser;
	guilds: OauthFlattenedGuild[];
}

export interface TransformedLoginData extends LoginData {
	transformedGuilds?: OauthFlattenedGuild[];
}
