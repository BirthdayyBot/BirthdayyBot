import type { APIEmbedField } from "discord.js";

export type EmbedInformationModel = {
	title?: string;
	description?: string;
	author_name?: string;
	author_avatar?: string;
	thumbnail_url?: string;
	image_url?: string;
	fields?: APIEmbedField[];
	color?: string;
};
