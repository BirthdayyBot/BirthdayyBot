import { BirthdayyCommand } from '#lib/structures';
import { BrandingColors } from '#utils/constants';
import { EmbedBuilder, TimestampStyles, time } from '@discordjs/builders';
import { ApplicationCommandRegistry, version as sapphireVersion } from '@sapphire/framework';
import { applyLocalizedBuilder, type TFunction } from '@sapphire/plugin-i18next';
import {
	ButtonStyle,
	ComponentType,
	OAuth2Scopes,
	PermissionFlagsBits,
	version as djsVersion,
	type APIActionRowComponent,
	type APIEmbedField,
	type APIMessageActionRowComponent
} from 'discord.js';
import { getFixedT } from 'i18next';
import { cpus, uptime, type CpuInfo } from 'os';

export class UserCommand extends BirthdayyCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((command) =>
			applyLocalizedBuilder(command, 'commands/info:name', 'commands/info:description')
		);
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const t = getFixedT(interaction.locale);
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
		const url = this.getInvite();
		const support = this.getSupportComponent(t);
		const github = this.getGitHubComponent(t);
		const donate = this.getPremiumComponent(t);
		return [this.getActionRow(support, this.getInviteComponent(t, url)), this.getActionRow(github, donate)];
	}

	private getActionRow(
		...components: APIMessageActionRowComponent[]
	): APIActionRowComponent<APIMessageActionRowComponent> {
		return { type: ComponentType.ActionRow, components };
	}

	private getSupportComponent(t: TFunction): APIMessageActionRowComponent {
		return {
			type: ComponentType.Button,
			style: ButtonStyle.Link,
			label: t('commands/info:buttonSupport'),
			emoji: { name: '🆘' },
			url: 'https://discord.gg/Bs9bSVe2Hf'
		};
	}

	private getInviteComponent(t: TFunction, url: string): APIMessageActionRowComponent {
		return {
			type: ComponentType.Button,
			style: ButtonStyle.Link,
			label: t('commands/info:buttonInvite'),
			emoji: { name: '🎉' },
			url
		};
	}

	private getGitHubComponent(t: TFunction): APIMessageActionRowComponent {
		return {
			type: ComponentType.Button,
			style: ButtonStyle.Link,
			label: t('commands/info:buttonGitHub'),
			emoji: { name: 'github2', id: '1229375525827645590' },
			url: 'https://github.com/BirthdayyBot/BirthdayyBot'
		};
	}

	private getPremiumComponent(t: TFunction): APIMessageActionRowComponent {
		return {
			type: ComponentType.Button,
			style: ButtonStyle.Link,
			label: t('commands/info:buttonPremium'),
			emoji: { name: '🧡' },
			url: 'https://birthdayy.xyz/premium'
		};
	}

	private formatCpuInfo({ times }: CpuInfo) {
		return `${Math.round(((times.user + times.nice + times.sys + times.irq) / times.idle) * 10000) / 100}%`;
	}

	private getInvite() {
		return this.container.client.generateInvite({
			scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
			permissions:
				PermissionFlagsBits.AddReactions |
				PermissionFlagsBits.AttachFiles |
				PermissionFlagsBits.EmbedLinks |
				PermissionFlagsBits.ManageRoles |
				PermissionFlagsBits.SendMessages |
				PermissionFlagsBits.SendMessagesInThreads |
				PermissionFlagsBits.UseExternalEmojis |
				PermissionFlagsBits.ViewChannel
		});
	}
}
