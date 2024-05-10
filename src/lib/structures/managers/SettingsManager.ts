import { BrandingColors, Emojis } from '#utils/constants';
import { type Guild, Prisma } from '@prisma/client';
import { container } from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { type Nullish } from '@sapphire/utilities';
import { type APIEmbed, Collection, EmbedBuilder, Guild as GuildDiscord } from 'discord.js';

export class SettingsManager extends Collection<SettingsManagerFetchData, Guild> {
	/**
	 * The Guild instance that manages this manager
	 */
	public guild: GuildDiscord;

	public guildId: string;

	public defaultKey = {
		announcementChannel: null,
		announcementMessage: `${Emojis.ArrowRight} Today is a special Day!{NEW_LINE}${Emojis.Gift} Please wish {MENTION} a happy Birthday <3`,
		birthdayPingRole: null,
		birthdayRole: null,
		logChannel: null,
		overviewChannel: null,
		timezone: 0
	};

	public constructor(guild: GuildDiscord) {
		super();
		this.guild = guild;
		this.guildId = this.guild.id;
	}

	public async create(args?: SettingsManagerCreateData): SettingsManagerReturnAsyncData {
		const settings = await container.prisma.guild.upsert({
			create: { ...args, guildId: this.guildId },
			where: { guildId: this.guildId },
			update: { ...args }
		});
		return this.insert(settings);
	}

	public async fetch(): SettingsManagerReturnAsyncData {
		return super.get(this.guildId) ?? this.create();
	}

	public insert(entry: Nullish): null;
	public insert(entry: Guild): SettingsManagerReturnData;
	public insert(entry: Guild | Nullish): SettingsManagerReturnData | null {
		if (!entry) return null;
		super.set(this.guildId, entry);
		return entry;
	}

	public async update(args: SettingsManagerCreateData): SettingsManagerReturnAsyncData {
		const settings = await this.create(args);
		return this.insert(settings);
	}

	// Create new Embed for list of settings
	public async embedList() {
		const settings = await this.fetch();
		const t = await fetchT(this.guild);
		const embed = t('commands/config:list.embedList', {
			returnObjects: true,
			defaultValue: 'null',
			lng: this.guild.preferredLocale,
			guild: this.guild,
			settings
		}) satisfies APIEmbed;

		container.logger.debug('SettingsManager -> embedList -> embed', JSON.stringify(embed));

		return new EmbedBuilder(embed).setColor(BrandingColors.Primary);
	}

	public async resetKey(key: SettingsDefaultKey): SettingsManagerReturnAsyncData {
		return this.update({ [key]: this.defaultKey[key] });
	}
}

export type SettingsManagerReturnData = Guild;
export type SettingsManagerFetchData = SettingsManagerReturnData['guildId'];
export type SettingsManagerReturnAsyncData = Promise<SettingsManagerReturnData>;

export type SettingsManagerCreateData = Omit<Prisma.GuildCreateInput, 'guildId'>;
export type SettingsDefaultKey = keyof Pick<
	Prisma.GuildCreateInput,
	| 'announcementChannel'
	| 'announcementMessage'
	| 'birthdayRole'
	| 'birthdayPingRole'
	| 'overviewChannel'
	| 'logChannel'
	| 'timezone'
>;
