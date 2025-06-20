import { BaseRepository } from '#core/repository/base_repository';
import { prisma } from '#core/services/prisma';
import { GuildConfig } from '#guild_config/domain/guild_config';
import { GuildConfigIdentifier } from '#guild_config/domain/guild_config_identifier';
import type { Guild } from '@prisma/client';

export class GuildConfigRepository extends BaseRepository<GuildConfigIdentifier, GuildConfig, Guild> {
	public constructor() {
		super('GuildConfigRepository', 'multitier');
	}

	public override toDomain(entity: Guild): GuildConfig {
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

	protected createInSource(key: GuildConfigIdentifier, entity: Omit<GuildConfig['props'], 'id'>): Promise<Guild> {
		return prisma.guild.create({
			data: {
				id: key.toString(),
				...entity
			}
		});
	}

	protected findFromSource(key: GuildConfigIdentifier): Promise<Guild | null> {
		return prisma.guild.findUnique({
			where: { id: key.toString() }
		});
	}

	protected updateInSource(
		key: GuildConfigIdentifier,
		entity: Partial<Omit<GuildConfig['props'], 'id'>>
	): Promise<Guild> {
		return prisma.guild.update({
			where: { id: key.toString() },
			data: entity
		});
	}

	protected deleteFromSource(key: GuildConfigIdentifier): Promise<Guild | null> {
		return prisma.guild.delete({
			where: { id: key.toString() }
		});
	}
}
