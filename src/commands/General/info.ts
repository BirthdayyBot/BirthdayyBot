import { BirthdayyCommand } from '#lib/structures';
import { seconds } from '#utils/common';
import { BrandingColors } from '#utils/constants';
import { isDevelopment } from '#utils/env';
import { DISCORD_INVITE } from '#utils/environment';
import { getEmbedAuthor } from '#utils/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, version as sapphireVersion } from '@sapphire/framework';
import { applyDescriptionLocalizedBuilder, fetchT } from '@sapphire/plugin-i18next';
import { roundNumber } from '@sapphire/utilities';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	MessageActionRowComponentBuilder,
	OAuth2Scopes,
	PermissionFlagsBits,
	TimestampStyles,
	version as djsVersion,
	time
} from 'discord.js';
import { TFunction } from 'i18next';
import { type CpuInfo, cpus, uptime } from 'os';

@ApplyOptions<BirthdayyCommand.Options>({
	description: 'commands/general:infoDescription',
	enabled: isDevelopment,
	name: 'info'
})
export class UserCommand extends BirthdayyCommand {
	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const t = await fetchT(interaction);
		const embed = await this.buildEmbed(t);
		const components = this.buildComponents(t);
		return interaction.reply({ components, embeds: [embed] });
	}

	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand(
			(builder) =>
				applyDescriptionLocalizedBuilder(builder, this.description)
					.setName('info')
					.setDMPermission(true)
					.setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel),
			{
				guildIds: ['980559116076470272']
			}
		);
	}

	private buildComponents(t: TFunction): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
		const componentLabels = t('commands/general:infoComponentLabels', { returnObjects: true }) as {
			addToServer: string;
			donate: string;
			repository: string;
			supportServer: string;
		};

		return [
			new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
				new ButtonBuilder() //
					.setStyle(ButtonStyle.Link)
					.setURL(this.inviteLink)
					.setLabel(componentLabels.addToServer)
					.setEmoji({ name: '🎉' }),
				new ButtonBuilder() //
					.setStyle(ButtonStyle.Link)
					.setURL(DISCORD_INVITE)
					.setLabel(componentLabels.supportServer)
					.setEmoji({ name: '🆘' })
			),
			new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
				new ButtonBuilder()
					.setStyle(ButtonStyle.Link)
					.setURL('https://github.com/BirthdayyBot/BirthdayyBot')
					.setLabel(componentLabels.repository)
					.setEmoji({ id: '1102222076380725319', name: 'link_birthdayy' }),
				new ButtonBuilder() //
					.setStyle(ButtonStyle.Link)
					.setURL('https://patreon.com/birthdayy')
					.setLabel(componentLabels.donate)
					.setEmoji({ name: '🧡' })
			)
		];
	}

	private async buildEmbed(t: TFunction) {
		const titles = t('commands/general:infoTitles', { returnObjects: true }) as {
			serverUsage: string;
			stats: string;
			uptime: string;
		};
		const fields = t('commands/general:infoFields', {
			database: await this.databaseStatistics(),
			returnObjects: true,
			stats: this.generalStatistics,
			uptime: this.uptimeStatistics,
			usage: this.usageStatistics
		}) as { serverUsage: string; stats: string; uptime: string; usage: string };

		return new EmbedBuilder()
			.setColor(BrandingColors.Primary)
			.setAuthor(getEmbedAuthor(this.container.client.user!))
			.setDescription(t('commands/general:infoBody'))
			.setTimestamp()
			.addFields(
				{ name: titles.stats, value: fields.stats },
				{ name: titles.uptime, value: fields.uptime },
				{ name: titles.serverUsage, value: fields.serverUsage }
			);
	}

	private async databaseStatistics() {
		const [birthdays, guilds, users] = await this.container.prisma.$transaction([
			this.container.prisma.birthday.count(),
			this.container.prisma.guild.count(),
			this.container.prisma.user.count()
		]);
		return { birthdays, guilds, users };
	}

	private static formatCpuInfo({ times }: CpuInfo) {
		return `${roundNumber(((times.user + times.nice + times.sys + times.irq) / times.idle) * 10000) / 100}%`;
	}

	private get generalStatistics(): StatsGeneral {
		const { client } = this.container;
		return {
			channels: client.channels.cache.size,
			djsVersion: `v${djsVersion}`,
			guilds: client.guilds.cache.size,
			nodeJs: process.version,
			sapphireVersion: `v${sapphireVersion}`,
			users: client.guilds.cache.reduce((acc, val) => acc + (val.memberCount ?? 0), 0)
		};
	}

	private get inviteLink() {
		return this.container.client.generateInvite({
			permissions:
				PermissionFlagsBits.ViewChannel |
				PermissionFlagsBits.ReadMessageHistory |
				PermissionFlagsBits.SendMessages |
				PermissionFlagsBits.EmbedLinks,
			scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands]
		});
	}

	private get uptimeStatistics(): StatsUptime {
		const now = Date.now();
		const nowSeconds = roundNumber(now / 1000);
		return {
			client: time(seconds.fromMilliseconds(now - this.container.client.uptime!), TimestampStyles.RelativeTime),
			host: time(roundNumber(nowSeconds - uptime()), TimestampStyles.RelativeTime),
			total: time(roundNumber(nowSeconds - process.uptime()), TimestampStyles.RelativeTime)
		};
	}

	private get usageStatistics(): StatsUsage {
		const usage = process.memoryUsage();
		return {
			cpuLoad: cpus().map(UserCommand.formatCpuInfo.bind(null)).join(' | '),
			ramTotal: usage.heapTotal / 1048576,
			ramUsed: usage.heapUsed / 1048576
		};
	}
}

export interface StatsGeneral {
	channels: number;
	djsVersion: string;
	guilds: number;
	nodeJs: string;
	sapphireVersion: string;
	users: number;
}

export interface StatsUptime {
	client: string;
	host: string;
	total: string;
}

export interface StatsUsage {
	cpuLoad: string;
	ramTotal: number;
	ramUsed: number;
}
