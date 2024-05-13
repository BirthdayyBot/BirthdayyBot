import {
	getActionRow,
	getGitHubComponent,
	getInviteComponent,
	getPremiumComponent,
	getSupportComponent
} from '#lib/discord/button';
import { getSupportedUserLanguageT } from '#lib/i18n/translate';
import { BirthdayyCommand } from '#lib/structures';
import { BrandingColors } from '#utils/constants';
import { EmbedBuilder, TimestampStyles, time } from '@discordjs/builders';
import { ApplicationCommandRegistry, version as sapphireVersion } from '@sapphire/framework';
import { applyLocalizedBuilder, type TFunction } from '@sapphire/plugin-i18next';
import { version as djsVersion, type APIEmbedField } from 'discord.js';
import { cpus, uptime, type CpuInfo } from 'os';

export class UserCommand extends BirthdayyCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((command) =>
			applyLocalizedBuilder(command, 'commands/info:name', 'commands/info:description')
		);
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const t = getSupportedUserLanguageT(interaction);
		const embed = new EmbedBuilder()
			.setColor(BrandingColors.Primary)
			.setAuthor({
				name: this.container.client.user!.tag,
				iconURL: this.container.client.user!.displayAvatarURL({ size: 128 })
			})
			.setDescription(t('commands/info:embedDescription'))
			.addFields(
				await this.getApplicationStatistics(t),
				this.getUptimeStatistics(t),
				this.getServerUsageStatistics(t, interaction.locale)
			);
		const components = this.getComponents(t);

		return interaction.reply({ embeds: [embed], components, ephemeral: true });
	}

	private async getApplicationStatistics(t: TFunction): Promise<APIEmbedField> {
		return {
			name: t('commands/info:embedFieldApplicationTitle'),
			value: t('commands/info:embedFieldApplicationValue', {
				channels: this.container.client.channels.cache.size,
				guilds: this.container.client.guilds.cache.size,
				users: this.container.client.guilds.cache.reduce((acc, val) => acc + (val.memberCount ?? 0), 0),
				birthdays: await this.container.prisma.birthday.count(),
				versionNode: process.version,
				versionDiscord: `v${djsVersion}`,
				versionSapphire: `v${sapphireVersion}`
			})
		};
	}

	private getUptimeStatistics(t: TFunction): APIEmbedField {
		const now = Date.now();
		const nowSeconds = Math.round(now / 1000);

		return {
			name: t('commands/info:embedFieldUptimeTitle'),
			value: t('commands/info:embedFieldUptimeValue', {
				host: time(Math.round(nowSeconds - uptime()), TimestampStyles.RelativeTime),
				client: time(Math.round(nowSeconds - process.uptime()), TimestampStyles.RelativeTime)
			})
		};
	}

	private getServerUsageStatistics(t: TFunction, lng: string): APIEmbedField {
		const usage = process.memoryUsage();
		return {
			name: t('commands/info:embedFieldServerUsageTitle'),
			value: t('commands/info:embedFieldServerUsageValue', {
				cpu: cpus().map(this.formatCpuInfo.bind(null)).join(' | '),
				heapUsed: (usage.heapUsed / 1048576).toLocaleString(lng, { maximumFractionDigits: 2 }),
				heapTotal: (usage.heapTotal / 1048576).toLocaleString(lng, { maximumFractionDigits: 2 })
			})
		};
	}

	private getComponents(t: TFunction) {
		return [
			getActionRow(
				getSupportComponent(t('commands/info:buttonSupport')),
				getInviteComponent(t('commands/info:buttonInvite'))
			),
			getActionRow(
				getGitHubComponent(t('commands/info:buttonGitHub')),
				getPremiumComponent(t('commands/info:buttonPremium'))
			)
		];
	}

	private formatCpuInfo({ times }: CpuInfo) {
		return `${Math.round(((times.user + times.nice + times.sys + times.irq) / times.idle) * 10000) / 100}%`;
	}
}
