/* eslint-disable no-case-declarations */
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { codeBlock } from '@sapphire/utilities';
import { channelMention, inlineCode, roleMention } from 'discord.js';
import generateBirthdayList from '../../helpers/generate/birthdayList';
import generateConfigListEmbed from '../../helpers/generate/configListEmbed';
import generateEmbed from '../../helpers/generate/embed';
import { isValidBirthdayMessage, setDefaultConfig } from '../../helpers/provide/config';
import { ARROW_RIGHT, FAIL, PLUS, PREMIUM_URL, SUCCESS } from '../../helpers/provide/environment';
import { hasChannelPermissions, hasGuildPermissions } from '../../helpers/provide/permission';
import replyToInteraction from '../../helpers/send/response';
import findOption from '../../helpers/utils/findOption';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import { ConfigCMD } from '../../lib/commands/config';
import { ConfigName, configNameExtended } from '../../lib/database';
import { sendMessage } from '../../lib/discord/message';
import thinking from '../../lib/discord/thinking';

@ApplyOptions<Subcommand.Options>({
	description: 'Config Command',
	requiredUserPermissions: ['Administrator', ['ManageGuild', 'ManageRoles']],
	subcommands: [
		{
			name: 'list',
			chatInputRun: 'configList'
		},
		{
			name: 'announcement-channel',
			chatInputRun: 'configAnnouncementChannel'
		},
		{
			name: 'overview-channel',
			chatInputRun: 'configOverviewChannel'
		},
		{
			name: 'birthday-role',
			chatInputRun: 'configBirthdayRole'
		},
		{
			name: 'ping-role',
			chatInputRun: 'configPingRole'
		},
		{
			name: 'timezone',
			chatInputRun: 'configTimezone'
		},
		{
			name: 'announcement-message',
			chatInputRun: 'configAnnouncementMessage'
		},
		{
			name: 'reset',
			chatInputRun: 'configReset'
		}
	]
})
export class ConfigCommand extends Subcommand {
	private messageOptions = {
		content: '',
		embed: {
			title: `${FAIL} Failure`,
			description: 'Something went wrong',
			fields: [],
			thumbnail_url: ''
		},
		components: []
	};

	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand(ConfigCMD(), {
			guildIds: getCommandGuilds('global')
		});
	}

	public async configList(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		// TODO: Implement configList Command
		await thinking(interaction);
		container.logger.info('Run configList Command');
		const guild_id = interaction.guildId;
		const configListEmbed = await generateConfigListEmbed(guild_id);
		await replyToInteraction(interaction, { embeds: [configListEmbed] });
	}

	public async configAnnouncementChannel(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		container.logger.info('Run configAnnouncementChannel Command');
		const announcement_channel = findOption(interaction, 'channel', interaction.channelId);
		if (await this.hasWritingPermissionsInChannel(interaction, announcement_channel)) {
			await this.setConfig(interaction, 'announcement_channel');
			const embed = generateEmbed(this.messageOptions.embed);
			await replyToInteraction(interaction, { embeds: [embed] });
		}
	}

	public async configOverviewChannel(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		container.logger.info('Run configOverviewChannel Command');
		const overview_channel = findOption(interaction, 'channel', interaction.channelId);
		if (await this.hasWritingPermissionsInChannel(interaction, overview_channel)) {
			await this.setConfig(interaction, 'overview_channel');

			const birthdayList = await generateBirthdayList(1, interaction.guildId);
			const birthdayListEmbed = generateEmbed(birthdayList.embed);
			const birthdayListComponents = birthdayList.components;
			const newBirthdayList = await sendMessage(overview_channel, { embeds: [birthdayListEmbed], components: birthdayListComponents });
			if (!newBirthdayList) return;
			await container.utilities.guild.set.OverviewMessage(interaction.guildId, newBirthdayList.id);

			const embed = generateEmbed(this.messageOptions.embed);
			await replyToInteraction(interaction, { embeds: [embed] });
		}
	}

	public async configBirthdayRole(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		container.logger.info('Run configBirthdayRole Command');
		if (await this.botHasManageRolesPermissions(interaction)) {
			await this.setConfig(interaction, 'birthday_role');
			const embed = generateEmbed(this.messageOptions.embed);
			await replyToInteraction(interaction, { embeds: [embed] });
		}
	}

	public async configPingRole(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		container.logger.info('Run configPingRole Command');
		if (await this.botHasManageRolesPermissions(interaction)) {
			await this.setConfig(interaction, 'ping_role');
			const embed = generateEmbed(this.messageOptions.embed);
			await replyToInteraction(interaction, { embeds: [embed] });
		}
	}

	public async configTimezone(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		container.logger.info('Run configTimezone Command');
		await this.setConfig(interaction, 'timezone');
		const embed = generateEmbed(this.messageOptions.embed);
		await replyToInteraction(interaction, { embeds: [embed] });
	}

	public async configAnnouncementMessage(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		container.logger.info('Run configAnnouncementMessage Command');
		await this.setConfig(interaction, 'announcement_message');
		const embed = generateEmbed(this.messageOptions.embed);
		await replyToInteraction(interaction, { embeds: [embed] });
	}

	public async configReset(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		const config = interaction.options.getString('config', true) as ConfigName;
		const configName = configNameExtended[config];
		await setDefaultConfig(config, interaction.guildId);
		this.messageOptions.embed.title = `${SUCCESS} Success`;
		this.messageOptions.embed.description = `${ARROW_RIGHT} You have reset the \`${configName}\` config.`;
		const embed = generateEmbed(this.messageOptions.embed);
		await replyToInteraction(interaction, { embeds: [embed] });
	}

	public async setConfig(interaction: Subcommand.ChatInputCommandInteraction<'cached'>, config: string): Promise<void> {
		const guild_id = interaction.guildId;
		try {
			switch (config) {
				case 'announcement_channel':
					const announcement_channel = interaction.options.getChannel('channel', true).id;
					await container.utilities.guild.set.AnnouncementChannel(guild_id, announcement_channel);
					this.messageOptions.embed.description = `${ARROW_RIGHT} You set the **Announcement Channel** to ${channelMention(
						announcement_channel
					)}`;
					break;
				case 'overview_channel':
					const overview_channel = interaction.options.getChannel('channel', true).id;
					await container.utilities.guild.set.OverviewChannel(guild_id, overview_channel);
					this.messageOptions.embed.description = `${ARROW_RIGHT} You set the **Overview Channel** to ${channelMention(overview_channel)}`;
					break;
				case 'birthday_role':
					const birthday_role = interaction.options.getRole('role', true).id;
					await container.utilities.guild.set.BirthdayRole(guild_id, birthday_role);
					this.messageOptions.embed.description = `${ARROW_RIGHT} You set the **Birthday Role** to ${roleMention(birthday_role)}`;
					break;
				case 'ping_role':
					const ping_role = interaction.options.getRole('role', true).id;
					await container.utilities.guild.set.BirthdayPingRole(guild_id, ping_role);
					this.messageOptions.embed.description = `${ARROW_RIGHT} You set the **Birthday Ping Role** to ${roleMention(ping_role)}`;
					break;
				case 'timezone':
					const timezone = interaction.options.getInteger('timezone', true);
					const timezoneString = timezone < 0 ? `UTC${timezone}` : `UTC+${timezone}`;
					await container.utilities.guild.set.Timezone(guild_id, timezone);
					this.messageOptions.embed.description = `${ARROW_RIGHT} You set the **Timezone** to ${inlineCode(timezoneString)}`;
					break;
				// * PREMIUM ONLY
				case 'announcement_message':
					const announcement_message = interaction.options.getString('message', true);
					const isPremium = await this.container.utilities.guild.check.isGuildPremium(guild_id);
					container.logger.info('isPremium: ', isPremium);
					const isBirthdayMessageValid = isValidBirthdayMessage(announcement_message);
					if (!isPremium) {
						this.messageOptions.embed.title = `${PLUS} Early access only`;
						this.messageOptions.embed.description = `${ARROW_RIGHT} This feature is currently in __Beta Stage__ and **Birthdayy Premium Only**.
                        If you are interested in using this and future features now already, you can support the Development on [Patreon](${PREMIUM_URL}).`;
						break;
					}
					if (!isBirthdayMessageValid || isBirthdayMessageValid.error) {
						this.messageOptions.embed.title = `${FAIL} Failure`;
						switch (isBirthdayMessageValid.error) {
							case 'MESSAGE_TOO_LONG':
								this.messageOptions.embed.description = `${ARROW_RIGHT} The **Announcement Message** is too long. The maximum allowed length is **3500** characters.`;
								break;
							case 'NO_CUSTOM_EMOJIS':
								this.messageOptions.embed.description = `${ARROW_RIGHT} The **Announcement Message** contains custom emojis, which are a **Premium Feature**. [Patreon](${PREMIUM_URL})`;
								break;
							default:
								this.messageOptions.embed.description = `${ARROW_RIGHT} The **Announcement Message** is invalid. Please try again.`;
								break;
						}
					}
					await container.utilities.guild.set.AnnouncementMessage(guild_id, announcement_message);
					container.logger.debug('announcement_message', announcement_message);
					this.messageOptions.embed.description = `${ARROW_RIGHT} You set the **Announcement Message** to \n${inlineCode(
						announcement_message
					)}`;
					break;
			}
			this.messageOptions.embed.title = `${SUCCESS} Success`;
		} catch (error: any) {
			if (error instanceof Error) {
				this.messageOptions.embed.title = `${FAIL} Failure`;
				container.logger.error('[setConfig] ', error);
				this.messageOptions.embed.description = `${codeBlock('js', `${error.message}`)}`;
			}
		}
	}

	private async hasWritingPermissionsInChannel(
		interaction: Subcommand.ChatInputCommandInteraction<'cached'>,
		channel_id: string
	): Promise<boolean> {
		const hasCorrectPermissions = await hasChannelPermissions({ interaction, permissions: ['ViewChannel', 'SendMessages'], channel: channel_id });
		if (!hasCorrectPermissions) {
			this.messageOptions.embed.title = `${FAIL} Failure`;
			this.messageOptions.embed.description = `${ARROW_RIGHT} I don't have the permission to see & send messages in ${channelMention(
				channel_id
			)}.`;
			const embed = generateEmbed(this.messageOptions.embed);
			await replyToInteraction(interaction, { embeds: [embed] });
			return false;
		}
		return true;
	}

	private async botHasManageRolesPermissions(interaction: Subcommand.ChatInputCommandInteraction<'cached'>): Promise<boolean> {
		const hasPermissions = await hasGuildPermissions({ interaction, permissions: ['ManageRoles'] });
		if (!hasPermissions) {
			this.messageOptions.embed.title = `${FAIL} Failure`;
			this.messageOptions.embed.description = `${ARROW_RIGHT} I don't have the permission to manage roles in this server.`;
			const embed = generateEmbed(this.messageOptions.embed);
			await replyToInteraction(interaction, { embeds: [embed] });
			return false;
		}
		return true;
	}
}
