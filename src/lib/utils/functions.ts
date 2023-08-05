import type { ChatInputCommandInteraction } from 'discord.js';

export function resolveTarget(interaction: ChatInputCommandInteraction) {
	const targetMember = interaction.options.getUser('user') ?? interaction.user;
	return {
		target: targetMember,
		targetIsAuthor: targetMember.id === interaction.user.id,
	};
}
