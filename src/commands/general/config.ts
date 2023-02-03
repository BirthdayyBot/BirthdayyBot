import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import generateEmbed from '../../helpers/generate/embed';
import { container } from '@sapphire/framework';
import ConfigCMD from '../../lib/commands/config';
import { FAIL } from '../../helpers/provide/environment';
import generateConfigListEmbed from '../../helpers/generate/configListEmbed';
import thinking from '../../helpers/send/thinking';
import replyToInteraction from '../../helpers/send/response';

@ApplyOptions<Subcommand.Options>({
	description: 'Config Command',
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
			name: 'remove',
			chatInputRun: 'configRemove'
		}
	]
})
export class ConfigCommand extends Subcommand {
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, {
			...options,
			description: 'Config Command'
		});
	}

	public override async registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand(await ConfigCMD(), {
			// idHints: ['1070852354959740928'], //only test guild ['1070853299072413746']
			guildIds: ['766707453994729532']
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

		const embed = await generateEmbed({ title: 'Template', description: 'A Template Command' });
		return await interaction.reply({ embeds: [embed] });
	}
}
