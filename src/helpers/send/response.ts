// import type { Command } from '@sapphire/framework';
// import type { APIActionRowComponent, APIMessageActionRowComponent, ActionRowData, InteractionReplyOptions, JSONEncodable } from 'discord.js';

// /**
//  * Sends a message to a Discord channel with the given content and optional embeds and components
//  *
//  * @param {object} args
//  * @property {Command.ChatInputCommandInteraction} interaction -
//  * @property {string} content - The content of the message to send
//  * @property {Array<Object>} [embeds] - An array of embed objects to include in the message
//  * @property {Array<Object>} [components] - An array of components to include in the message
//  * @property {boolean} [ephemeral=false] - Whether the message should be an ephemeral message
//  *
//  */
// module.exports = async (args: {
// 	interaction: Command.ChatInputCommandInteraction;
// 	content: string;
// 	embeds?: Array<Object>;
// 	components?: APIActionRowComponent<APIMessageActionRowComponent> | JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>;
// 	ephemeral?: boolean;
// }) => {
// 	const { interaction, content, embeds, components, ephemeral } = args;
// 	//{ content: string; embeds?: Array<Object> | null; components?: Array<Object> | null; ephemeral?: boolean | null }
// 	let obj: InteractionReplyOptions = {
// 		content: `${content}`,
// 		embeds: embeds,
// 		components: components,
// 		ephemeral: ephemeral
// 	};
// 	interaction.reply(obj);
// };
