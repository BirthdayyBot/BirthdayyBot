import { ReferredPromise, createReferPromise, floatPromise } from '#utils/functions/promises';
import { CollectionConstructor } from '@discordjs/collection';
import { Guild, Prisma } from '@prisma/client';
import { container } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { cast } from '@sapphire/utilities';
import { Collection, Guild as GuildDiscord } from 'discord.js';

enum CacheActions {
	None,
	Fetch,
	Insert,
}

export class SettingsManager extends Collection<string, Guild> {
	/**
	 * The Guild instance that manages this manager
	 */
	public guild: GuildDiscord;

	/**
	 * The current case count
	 */
	private _count: number | null = null;

	/**
	 * The timer that sweeps this manager's entries
	 */
	private _timer: NodeJS.Timeout | null = null;

	/**
	 * The promise to wait for tasks to complete
	 */
	private readonly _locks: ReferredPromise<void>[] = [];

	public constructor(guild: GuildDiscord) {
		super();
		this.guild = guild;
	}

	public async create(data: Prisma.GuildCreateInput): Promise<Guild> {
		const guild = await container.prisma.guild.create({ data });
		return guild;
	}

	public async fetch(id: string): Promise<Guild | null>;
	public async fetch(id: string[]): Promise<Collection<string, Guild>>;
	public async fetch(id?: null): Promise<this>;
	public async fetch(id?: string | string[] | null): Promise<Guild | Collection<string, Guild> | this | null> {
		// Case number
		if (typeof id === 'string') {
			return (
				super.get(id) ||
				this._cache(
					await container.prisma.guild.findFirstOrThrow({ where: { guildId: id } }),
					CacheActions.None,
				)
			);
		}

		if (Array.isArray(id) && id.length) {
			return this._cache(
				await container.prisma.guild.findMany({ where: { guildId: { in: id } } }),
				CacheActions.None,
			);
		}

		if (super.size !== this._count) {
			this._cache(await container.prisma.guild.findMany({}), CacheActions.Fetch);
		}

		return this;
	}

	public async update(args: Prisma.GuildUpdateArgs) {
		const settings = await container.prisma.guild.update(args);
		return this._cache(settings, CacheActions.Insert);
	}

	public async upsert(args: Prisma.GuildUpsertArgs) {
		const settings = await container.prisma.guild.upsert(args);
		return this._cache(settings, CacheActions.Insert);
	}

	public insert(data: Guild): Guild;
	public insert(data: Guild[]): Collection<string, Guild>;
	public insert(data: Guild | Guild[]) {
		// @ts-expect-error TypeScript does not read the overloaded `data` parameter correctly
		return this._cache(data, CacheActions.Insert);
	}

	public createLock() {
		// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
		const lock = createReferPromise<void>();
		this._locks.push(lock);
		floatPromise(
			lock.promise.finally(() => {
				this._locks.splice(this._locks.indexOf(lock), 1);
			}),
		);

		return lock.resolve();
	}

	private _cache(entry: Guild, type: CacheActions): Guild;
	private _cache(entries: Guild[], type: CacheActions): Collection<string, Guild>;
	private _cache(entries: Guild | Guild[] | null, type: CacheActions): Collection<string, Guild> | Guild | null {
		if (!entries) return null;

		const parsedEntries = Array.isArray(entries) ? entries : [entries];

		for (const entry of parsedEntries) {
			super.set(entry.guildId, entry);
		}

		if (type === CacheActions.Insert) this._count! += parsedEntries.length;

		if (!this._timer) {
			this._timer = setInterval(() => {
				super.sweep(() => Date.now() > Time.Minute * 15);
				if (!super.size) this._timer = null;
			}, 1000);
		}

		return Array.isArray(entries)
			? new Collection<string, Guild>(entries.map((entry) => [entry.guildId, entry]))
			: entries;
	}

	public static get [Symbol.species]() {
		return cast<CollectionConstructor>(Collection);
	}
}
