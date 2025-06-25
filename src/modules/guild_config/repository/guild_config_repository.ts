import { BaseRepository } from '#core/repository/base_repository';
import { prisma } from '#core/services/prisma';
import { GuildConfig } from '#guild_config/domain/guild_config';
import { GuildConfigIdentifier } from '#guild_config/domain/guild_config_identifier';
import type { Guild as PrismaGuildConfig } from '@prisma/client';

function convertsObjectValueNullToUndefined(obj: Record<string, any>): Record<string, any> {
	const result: Record<string, any> = {};
	for (const [key, value] of Object.entries(obj)) {
		result[key] = value === null ? undefined : value;
	}
	return result;
}

export class GuildConfigRepository extends BaseRepository<GuildConfigIdentifier, GuildConfig, PrismaGuildConfig> {
	public constructor() {
		super('GuildConfigRepository', 'multitier');
	}

	public updateKey<K extends keyof GuildConfig['props']>(
		identifier: GuildConfigIdentifier,
		key: K,
		value: GuildConfig['props'][K]
	): Promise<GuildConfig | null> {
		return this.cache.getOrSet({
			key: this.getCacheKey(`${identifier.toString()}:${key}`),
			ttl: this.ttl,
			factory: async () => {
				const updatedEntity = await this.updateKeyInDatabase(identifier, key, value);
				return updatedEntity ? this.toDomain(updatedEntity) : null;
			}
		});
	}

	public toDomain(entity: PrismaGuildConfig): GuildConfig {
		return GuildConfig.create({
			id: GuildConfigIdentifier.fromString(entity.id),
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
			disabled: entity.disabled,
			premium: entity.premium,
			language: entity.language,
			timezone: entity.timezone,
			announcementChannel: entity.announcementChannel,
			announcementMessage: entity.announcementMessage,
			overviewChannel: entity.overviewChannel,
			overviewMessage: entity.overviewMessage,
			birthdayRole: entity.birthdayRole,
			birthdayPingRole: entity.birthdayPingRole,
			logChannel: entity.logChannel,
			inviter: entity.inviter
		});
	}

	protected async saveToDatabase(entity: GuildConfig): Promise<PrismaGuildConfig> {
		const { identifier } = entity;

		return prisma.guild.upsert({
			where: { id: identifier.toString() },
			update: convertsObjectValueNullToUndefined(entity.props),
			create: {
				id: identifier.toString(),
				...convertsObjectValueNullToUndefined(entity.props)
			}
		});
	}

	protected async removeFromDatabase(identifier: GuildConfigIdentifier): Promise<PrismaGuildConfig | null> {
		const key = identifier.toString();
		return prisma.guild
			.delete({
				where: { id: key }
			})
			.catch(() => null);
	}

	protected async findInDatabase(identifier: GuildConfigIdentifier): Promise<PrismaGuildConfig | null> {
		const key = identifier.toString();
		return prisma.guild
			.findUnique({
				where: { id: key }
			})
			.catch(() => null);
	}

	protected async updateKeyInDatabase<K extends keyof GuildConfig['props']>(
		identifier: GuildConfigIdentifier,
		key: K,
		value: GuildConfig['props'][K]
	): Promise<PrismaGuildConfig | null> {
		const keyString = identifier.toString();

		return prisma.guild
			.update({
				where: { id: keyString },
				data: convertsObjectValueNullToUndefined({
					[key]: value
				})
			})
			.catch(() => null);
	}
}
