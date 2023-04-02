import type { APIEmbedField } from 'discord.js';

export interface CustomEmbedModel {
	title: string;
	description: string;
	fields?: Array<APIEmbedField>;
	thumbnail_url?: string;
}
