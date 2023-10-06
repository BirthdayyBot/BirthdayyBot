import { CollectionConstructor } from '@discordjs/collection';
import { Guild, Prisma } from '@prisma/client';
import { container } from '@sapphire/framework';
import { Nullish, cast } from '@sapphire/utilities';
import { Collection, Guild as GuildDiscord } from 'discord.js';

export class SettingsManager extends Collection<SettingsManagerFetchData, Guild> {
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
		return container.prisma.guild.upsert({
			create: { ...args, guildId: this.guildId },
			where: { guildId: this.guildId },
			update: { ...args },
		});
	}

	public async fetch(): SettingsManagerReturnAsyncData {
		return super.get(this.guildId) ?? this.create();
	}

	public override get(key: string): SettingsManagerReturnData | undefined {
		return super.get(key);
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

	public static get [Symbol.species]() {
		return cast<CollectionConstructor>(Collection);
	}
}

export type SettingsManagerReturnData = Guild;
export type SettingsManagerFetchData = SettingsManagerReturnData['guildId'];
export type SettingsManagerReturnAsyncData = Promise<SettingsManagerReturnData>;

export type SettingsManagerCreateData = Omit<Prisma.GuildCreateInput, 'guildId'>;
export type SettingsManagerUpdateData = SettingsManagerCreateData;
