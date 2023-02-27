import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import generateEmbed from '../../helpers/generate/embed';
import { container } from '@sapphire/framework';
import { ConfigCMD } from '../../lib/commands/config';
import { ARROW_RIGHT, DEBUG, FAIL, PLUS, PREMIUM_URL, SUCCESS } from '../../helpers/provide/environment';
import generateConfigListEmbed from '../../helpers/generate/configListEmbed';
import thinking from '../../lib/discord/thinking';
import replyToInteraction from '../../helpers/send/response';
import findOption from '../../helpers/utils/findOption';
import {
	getConfig,
	setANNOUNCEMENT_CHANNEL,
	setANNOUNCEMENT_MESSAGE,
	setBIRTHDAY_PING_ROLE,
	setBIRTHDAY_ROLE,
	setDefaultConfig,
	setOVERVIEW_CHANNEL,
	setTIMEZONE
} from '../../helpers/provide/config';
import type { APIResponseModel } from '../../lib/model/APIResponse.model';
import type { GuildConfigModel } from '../../lib/model';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import { getConfigName } from '../../helpers/utils/string';

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
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, {
			...options
		});
	}

	public override async registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand(await ConfigCMD(), {
			guildIds: getCommandGuilds('global')
		});
	}

	content = ``;
	embed = {
		title: `${FAIL} Failure`,
		description: `Something went wrong`,
		fields: [],
		thumbnail_url: ''
	};
	components = [];

	public async configList(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		//TODO: Implement configList Command
		await thinking(interaction);
		container.logger.info('Run configList Command');
		const guild_id = interaction.guildId!;
		const configListEmbed = await generateConfigListEmbed(guild_id);
		await replyToInteraction(interaction, { embeds: [configListEmbed] });
		return;
	}

	public async configAnnouncementChannel(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		await thinking(interaction);
		container.logger.info('Run configAnnouncementChannel Command');
		//TODO: #14 Check if Bot has write permissions in channel
		await this.setConfig(interaction, 'announcement_channel');
		const embed = await generateEmbed(this.embed);
		await replyToInteraction(interaction, { embeds: [embed] });
	}

	public async configOverviewChannel(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		await thinking(interaction);
		container.logger.info('Run configOverviewChannel Command');
		//TODO: #14 Check if Bot has write permissions in channel
		await this.setConfig(interaction, 'overview_channel');
		await setDefaultConfig('overview_message', interaction.guildId!);
		const embed = await generateEmbed(this.embed);
		await replyToInteraction(interaction, { embeds: [embed] });
	}

	public async configBirthdayRole(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		await thinking(interaction);
		container.logger.info('Run configBirthdayRole Command');
		//TODO: #15 Check if Bot has manage role permissions in guild
		await this.setConfig(interaction, 'birthday_role');
		const embed = await generateEmbed(this.embed);
		await replyToInteraction(interaction, { embeds: [embed] });
	}

	public async configPingRole(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		await thinking(interaction);
		container.logger.info('Run configPingRole Command');
		//TODO: #15 Check if Bot has manage role permissions in guild
		await this.setConfig(interaction, 'ping_role');
		const embed = await generateEmbed(this.embed);
		await replyToInteraction(interaction, { embeds: [embed] });
	}

	public async configTimezone(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		await thinking(interaction);
		container.logger.info('Run configTimezone Command');
		await this.setConfig(interaction, 'timezone');
		const embed = await generateEmbed(this.embed);
		await replyToInteraction(interaction, { embeds: [embed] });
	}

	public async configAnnouncementMessage(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		await thinking(interaction);
		container.logger.info('Run configAnnouncementMessage Command');
		await this.setConfig(interaction, 'announcement_message');
		const embed = await generateEmbed(this.embed);
		await replyToInteraction(interaction, { embeds: [embed] });
	}

	public async configReset(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		await thinking(interaction);
		const config: string = findOption(interaction, 'config');
		const configName = getConfigName(config);
		const result = await setDefaultConfig(config, interaction.guildId!);
		if (result?.success) {
			this.embed.title = `${SUCCESS} Success`;
			this.embed.description = `${ARROW_RIGHT} You have reset the \`${configName}\` config.`;
		} else {
			this.embed.title = `${FAIL} Failure`;
			this.embed.description = `${result?.message}`;
		}
		const embed = await generateEmbed(this.embed);
		await replyToInteraction(interaction, { embeds: [embed] });
	}

	public async setConfig(interaction: Subcommand.ChatInputCommandInteraction, config: string): Promise<APIResponseModel> {
		const guild_id = interaction.guildId!;
		let result: APIResponseModel = {
			success: false,
			code: 404,
			message: `Option not found`,
			data: {
				guild_id: guild_id
			}
		};
		switch (config) {
			case 'announcement_channel':
				const announcement_channel = findOption(interaction, 'channel');
				result = await setANNOUNCEMENT_CHANNEL(announcement_channel, guild_id);
				if (result.success)
					this.embed.description = `${ARROW_RIGHT} You set the **Announcement Channel** to <#${result.data.announcement_channel}>`;
				break;
			case 'overview_channel':
				const overview_channel = findOption(interaction, 'channel');
				result = await setOVERVIEW_CHANNEL(overview_channel, guild_id);
				if (result.success) this.embed.description = `${ARROW_RIGHT} You set the **Overview Channel** to <#${result.data.overview_channel}>`;
				break;
			case 'birthday_role':
				const birthday_role = findOption(interaction, 'role');
				result = await setBIRTHDAY_ROLE(birthday_role, guild_id);
				if (result.success) this.embed.description = `${ARROW_RIGHT} You set the **Birthday Role** to <@&${result.data.birthday_role}>`;
				break;
			case 'ping_role':
				const ping_role = findOption(interaction, 'role');
				result = await setBIRTHDAY_PING_ROLE(ping_role, guild_id);
				if (result.success)
					this.embed.description = `${ARROW_RIGHT} You set the **Birthday Ping Role** to <@&${result.data.birthday_ping_role}>`;
				break;
			case 'timezone':
				const timezone = findOption(interaction, 'timezone');
				result = await setTIMEZONE(timezone, guild_id);
				const timezoneString = timezone < 0 ? `UTC${timezone}` : `UTC+${timezone}`;
				if (result.success) this.embed.description = `${ARROW_RIGHT} You set the **Timezone** to \`${timezoneString}\``;
				break;
			// * PREMIUM ONLY
			case 'announcement_message':
				let config: GuildConfigModel = await getConfig(guild_id);
				if (config.PREMIUM) {
					const announcement_message = findOption(interaction, 'message');
					console.log('announcement_message', announcement_message);
					result = await setANNOUNCEMENT_MESSAGE(announcement_message, guild_id);
					if (result.success)
						this.embed.description = `${ARROW_RIGHT} You set the **Announcement Message** to \n\`${result.data.announcement_message}\``;
				} else {
					this.embed.title = `${PLUS} Early access only`;
					this.embed.description = `${ARROW_RIGHT} This feature is currently in __Beta Stage__ and **Birthdayy Premium Only**. 
                    If you are interested in using this and future features now already, you can support the Development on [Patreon](${PREMIUM_URL}).`;
					result.success = false;
					result.message = 'premium';
				}
				break;
		}
		if (result.success) {
			console.log(DEBUG ? 'config success' : '');
			this.embed.title = `${SUCCESS} Success`;
		} else if (!result.success) {
			if (result.message === 'premium') {
				return result;
			}
			console.log(DEBUG ? 'config failure' : '');
			this.embed.title = `${FAIL} Failure`;
			this.embed.description = `\`${result.message}\``;
		}
		return result;
	}
}
