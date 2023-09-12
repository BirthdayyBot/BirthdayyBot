import { DecoratorIdentifiers, createFunctionPrecondition } from '@sapphire/decorators';
import { UserError, type Command } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { PermissionsBitField, type PermissionResolvable } from 'discord.js';

export const RequiresUserPermissionsIfTargetIsNotAuthor = (
	key: string,
	...permissionsResolvable: PermissionResolvable[]
): MethodDecorator => {
	const resolved = new PermissionsBitField(permissionsResolvable);

	return createFunctionPrecondition(async (interaction: Command.ChatInputCommandInteraction<'cached'>) => {
		const targetId = (interaction.options.getUser('user') ?? interaction.user).id;
		const { user, memberPermissions, member } = interaction;
		const authorIsNotTarget = user.id !== targetId;

		if (authorIsNotTarget && !memberPermissions.has(resolved)) {
			const message = await resolveKey(interaction, `${key}.hasNotPermissionManagesRoles`);
			throw new UserError({
				identifier: DecoratorIdentifiers.RequiresUserPermissionsMissingPermissions,
				message,
			});
		}

		const authorPosistion = member.roles.highest.position;
		const targetPosition = (await interaction.guild.members.fetch(targetId)).roles.highest.position;

		if (authorIsNotTarget && authorPosistion <= targetPosition) {
			const message = await resolveKey(interaction, `${key}.hasNotPermissionToManageThisUser`);
			throw new UserError({
				identifier: DecoratorIdentifiers.RequiresUserPermissionsMissingPermissions,
				message,
			});
		}

		return true;
	});
};
