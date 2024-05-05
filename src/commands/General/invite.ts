import { BirthdayyCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { BrandingColors } from '#utils/constants';
import { Permission_Bits } from '#utils/environment';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import { type TFunction, applyLocalizedBuilder, fetchT } from '@sapphire/plugin-i18next';
import { EmbedBuilder, OAuth2Scopes, hyperlink } from 'discord.js';
@ApplyOptions<BirthdayyCommand.Options>({
	description: 'commands/invite:description',
	detailedDescription: 'commands/invite:detailedDescription',
	permissionLevel: PermissionLevels.Everyone
})
export class UserCommand extends BirthdayyCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) =>
			applyLocalizedBuilder(builder, 'commands/invite:name', 'commands/invite:description')
				.setDMPermission(true)
				.addBooleanOption((option) =>
					applyLocalizedBuilder(option, 'commands/invite:inviteOptionsPermissions').setRequired(false)
				)
		);
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const shouldNotAddPermissions = interaction.options.getBoolean('permissions') ?? false;
		const embed = this.getEmbed(await fetchT(interaction), shouldNotAddPermissions);
		return interaction.reply({ embeds: [embed], ephemeral: false });
	}

	private getEmbed(t: TFunction, shouldNotAddPermissions: boolean): EmbedBuilder {
		const embeddedInviteLink = hyperlink(
			t('commands/general:invitePermissionInviteText'),
			this.generateInviteLink(shouldNotAddPermissions)
		);
		const embeddedJoinLink = hyperlink(
			t('commands/invite:invitePermissionSupportServerText'),
			'https://discord.birthdayy.xyz'
		);

		return new EmbedBuilder() //
			.setColor(BrandingColors.Primary)
			.setDescription(
				[
					[embeddedInviteLink, embeddedJoinLink].join(' | '),
					shouldNotAddPermissions ? undefined : t('commands/invite:invitePermissionsDescription')
				]
					.filter(Boolean)
					.join('\n')
			);
	}

	private generateInviteLink(shouldNotAddPermissions: boolean) {
		return this.container.client.generateInvite({
			scopes: [OAuth2Scopes.ApplicationsCommands, OAuth2Scopes.Bot],
			permissions: shouldNotAddPermissions ? 0n : Permission_Bits
		});
	}
}
