import { CustomCommand } from '#lib/structures/commands/CustomCommand';
import { BrandingColors, DISCORD_INVITE, getEmbedAuthor, isDevelopment } from '#utils';
import { seconds } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import { version as sapphireVersion } from '@sapphire/framework';
import { applyDescriptionLocalizedBuilder, fetchT } from '@sapphire/plugin-i18next';
import { roundNumber } from '@sapphire/utilities';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	version as djsVersion,
	EmbedBuilder,
	MessageActionRowComponentBuilder,
	OAuth2Scopes,
	PermissionFlagsBits,
	time,
	TimestampStyles,
} from 'discord.js';
import { TFunction } from 'i18next';
import { cpus, uptime, type CpuInfo } from 'os';

@ApplyOptions<CustomCommand.Options>({
	name: 'info',
	description: 'commands/general:infoDescription',
	enabled: isDevelopment,
})
export class UserCommand extends CustomCommand {
	public override registerApplicationCommands(registry: CustomCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				applyDescriptionLocalizedBuilder(builder, this.description)
					.setName('info')
					.setDMPermission(true)
					.setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel),
			{
				guildIds: ['980559116076470272'],
			},
		);
	}

	public override async chatInputRun(interaction: CustomCommand.ChatInputCommandInteraction) {
		const t = await fetchT(interaction);
		const embed = await this.buildEmbed(t);
		const components = this.buildComponents(t);
		return interaction.reply({ embeds: [embed], components });
	}

	private buildComponents(t: TFunction): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
		const componentLabels = t('commands/general:infoComponentLabels', { returnObjects: true }) as {
			addToServer: string;
			supportServer: string;
			repository: string;
			donate: string;
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
					.setEmoji({ name: '🆘' }),
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
					.setEmoji({ name: '🧡' }),
			),
		];
	}

	private get inviteLink() {
		return this.container.client.generateInvite({
			scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
			permissions:
				PermissionFlagsBits.ViewChannel |
				PermissionFlagsBits.ReadMessageHistory |
				PermissionFlagsBits.SendMessages |
				PermissionFlagsBits.EmbedLinks,
		});
	}

	private async buildEmbed(t: TFunction) {
		const titles = t('commands/general:infoTitles', { returnObjects: true }) as {
			stats: string;
			uptime: string;
			serverUsage: string;
		};
		const fields = t('commands/general:infoFields', {
			stats: this.generalStatistics,
			uptime: this.uptimeStatistics,
			usage: this.usageStatistics,
			database: await this.databaseStatistics(),
			returnObjects: true,
		}) as { stats: string; uptime: string; usage: string; serverUsage: string };

		return new EmbedBuilder()
			.setColor(BrandingColors.Primary)
			.setAuthor(getEmbedAuthor(this.container.client.user!))
			.setDescription(t('commands/general:infoBody'))
			.setTimestamp()
			.addFields(
				{ name: titles.stats, value: fields.stats },
				{ name: titles.uptime, value: fields.uptime },
				{ name: titles.serverUsage, value: fields.serverUsage },
			);
	}

	private get generalStatistics(): StatsGeneral {
		const { client } = this.container;
		return {
			channels: client.channels.cache.size,
			guilds: client.guilds.cache.size,
			nodeJs: process.version,
			users: client.guilds.cache.reduce((acc, val) => acc + (val.memberCount ?? 0), 0),
			djsVersion: `v${djsVersion}`,
			sapphireVersion: `v${sapphireVersion}`,
		};
	}

	private async databaseStatistics() {
		const [birthdays, guilds, users] = await this.container.prisma.$transaction([
			this.container.prisma.birthday.count(),
			this.container.prisma.guild.count(),
			this.container.prisma.user.count(),
		]);
		return { birthdays, guilds, users };
	}

	private get uptimeStatistics(): StatsUptime {
		const now = Date.now();
		const nowSeconds = roundNumber(now / 1000);
		return {
			client: time(seconds.fromMilliseconds(now - this.container.client.uptime!), TimestampStyles.RelativeTime),
			host: time(roundNumber(nowSeconds - uptime()), TimestampStyles.RelativeTime),
			total: time(roundNumber(nowSeconds - process.uptime()), TimestampStyles.RelativeTime),
		};
	}

	private get usageStatistics(): StatsUsage {
		const usage = process.memoryUsage();
		return {
			cpuLoad: cpus().map(UserCommand.formatCpuInfo.bind(null)).join(' | '),
			ramTotal: usage.heapTotal / 1048576,
			ramUsed: usage.heapUsed / 1048576,
		};
	}

	private static formatCpuInfo({ times }: CpuInfo) {
		return `${roundNumber(((times.user + times.nice + times.sys + times.irq) / times.idle) * 10000) / 100}%`;
	}
}

export interface StatsGeneral {
	channels: number;
	guilds: number;
	nodeJs: string;
	users: number;
	djsVersion: string;
	sapphireVersion: string;
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
