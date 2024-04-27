import { BrandingColors, Emojis } from '#lib/utils/constants';
import { Guild, Prisma } from '@prisma/client';
import { container } from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { Nullish } from '@sapphire/utilities';
import { APIEmbed, Collection, EmbedBuilder, Guild as GuildDiscord } from 'discord.js';

export class SettingsManager extends Collection<SettingsManagerFetchData, Guild> {
	public defaultKey = {
		channelsAnnouncement: null,
		channelsLogs: null,
		channelsOverview: null,
		messagesAnnouncement: `${Emojis.Arrow} Today is a special Day!{NEW_LINE}${Emojis.Gift} Please wish {MENTION} a happy Birthday <3`,
		rolesBirthday: null,
		rolesNotified: [],
		timezone: 0
	};

	/**
	 * The Guild instance that manages this manager
	 */
	public guild: GuildDiscord;

	public guildId: string;

	public constructor(guild: GuildDiscord) {
		super();
		this.guild = guild;
		this.guildId = this.guild.id;
	}

	public async create(args?: SettingsManagerCreateData): SettingsManagerReturnAsyncData {
		const settings = await container.prisma.guild.upsert({
			create: { ...args, id: this.guildId },
			update: { ...args },
			where: { id: this.guildId }
		});
		return this.insert(settings);
	}

	// Create new Embed for list of settings
	public async embedList() {
		const settings = await this.fetch();
		const t = await fetchT(this.guild);
		const embed = t('commands/config:list.embedList', {
			defaultValue: 'null',
			guild: this.guild,
			lng: this.guild.preferredLocale,
			returnObjects: true,
			settings
		}) satisfies APIEmbed;

		container.logger.debug('SettingsManager -> embedList -> embed', JSON.stringify(embed));

		return new EmbedBuilder(embed).setColor(BrandingColors.Primary);
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

	public async resetKey(key: SettingsDefaultKey): SettingsManagerReturnAsyncData {
		return this.update({ [key]: this.defaultKey[key] });
	}

	public async update(args: SettingsManagerCreateData): SettingsManagerReturnAsyncData {
		const settings = await this.create(args);
		return this.insert(settings);
	}
}

export type SettingsManagerReturnData = Guild;
export type SettingsManagerFetchData = SettingsManagerReturnData['id'];
export type SettingsManagerReturnAsyncData = Promise<SettingsManagerReturnData>;

export type SettingsManagerCreateData = Omit<Prisma.GuildCreateInput, 'id'>;
export type SettingsManagerUpdateData = SettingsManagerCreateData;
export type SettingsDefaultKey = keyof Pick<
	Prisma.GuildCreateInput,
	'channelsAnnouncement' | 'channelsLogs' | 'channelsOverview' | 'rolesBirthday' | 'rolesNotified' | 'timezone'
>;
