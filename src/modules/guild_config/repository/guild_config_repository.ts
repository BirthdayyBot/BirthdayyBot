import { bento } from '#root/modules/core/services/cache';
import { prisma } from '#root/modules/core/services/prisma';
import { GuildConfig } from '#root/modules/guild_config/domain/guild_config.js';
import { GuildConfigIdentifier } from '#root/modules/guild_config/domain/guild_config_identifier.js';
import type { Guild as PrismaGuild } from '@prisma/client';

interface StoreGuildConfigDTO {
	id: string;
	disabled: boolean;
	premium: boolean;
}

interface UpdateGuildConfigDTO {
	id: string;
	disabled?: boolean;
	premium?: boolean;
	language?: string;
	timezone?: string;
	announcementChannel?: string | null;
	announcementMessage?: string | null;
	overviewChannel?: string | null;
	overviewMessage?: string | null;
	birthdayRole?: string | null;
	birthdayPingRole?: string | null;
	logChannel?: string | null;
	inviter?: string | null;
}

export class GuildConfigRepository {
	public async findById(id: GuildConfigIdentifier): Promise<GuildConfig | null> {
		const guildConfigRecord = await bento.getOrSet({
			key: this.getCacheKey(id),
			factory: () => {
				return prisma.guild.findUnique({
					where: { id: id.toString() }
				});
			},
			ttl: 60 * 60 // Cache for 1 hour
		});

		if (!guildConfigRecord) {
			return null;
		}
		return this.toDomain(guildConfigRecord);
	}

	public async create(dto: StoreGuildConfigDTO): Promise<GuildConfig> {
		const guildConfigRecord = await prisma.guild.create({
			data: {
				id: dto.id,
				disabled: dto.disabled,
				premium: dto.premium
			}
		});

		await bento.set({
			key: this.getCacheKey(GuildConfigIdentifier.fromString(guildConfigRecord.id)),
			value: guildConfigRecord,
			ttl: 60 * 60 // Cache for 1 hour
		});

		return this.toDomain(guildConfigRecord);
	}

	public async update(dto: UpdateGuildConfigDTO): Promise<GuildConfig | null> {
		try {
			const guildConfigRecord = await prisma.guild.update({
				where: { id: dto.id },
				data: {
					disabled: dto.disabled,
					premium: dto.premium
				}
			});

			if (!guildConfigRecord) {
				return null;
			}

			await bento.set({
				key: this.getCacheKey(GuildConfigIdentifier.fromString(guildConfigRecord.id)),
				value: guildConfigRecord,
				ttl: 60 * 60 // Cache for 1 hour
			});

			return this.toDomain(guildConfigRecord);
		} catch (error) {
			return null;
		}
	}

	public async delete(id: GuildConfigIdentifier): Promise<GuildConfig | null> {
		const guildConfigRecord = await prisma.guild
			.delete({
				where: { id: id.toString() }
			})
			.catch(() => null);

		if (!guildConfigRecord) {
			return null;
		}

		await bento.delete({
			key: this.getCacheKey(GuildConfigIdentifier.fromString(guildConfigRecord.id))
		});

		return this.toDomain(guildConfigRecord);
	}

	private getCacheKey(id: GuildConfigIdentifier): string {
		return `guildConfig:${id.toString()}`;
	}

	private toDomain(guildConfigRecord: PrismaGuild): GuildConfig {
		return GuildConfig.create({
			id: GuildConfigIdentifier.fromString(guildConfigRecord.id),
			createdAt: guildConfigRecord.createdAt,
			updatedAt: guildConfigRecord.updatedAt,
			disabled: guildConfigRecord.disabled,
			premium: guildConfigRecord.premium,
			language: guildConfigRecord.language,
			timezone: guildConfigRecord.timezone,
			announcementChannel: guildConfigRecord.announcementChannel,
			announcementMessage: guildConfigRecord.announcementMessage,
			overviewChannel: guildConfigRecord.overviewChannel,
			overviewMessage: guildConfigRecord.overviewMessage,
			birthdayRole: guildConfigRecord.birthdayRole,
			birthdayPingRole: guildConfigRecord.birthdayPingRole,
			logChannel: guildConfigRecord.logChannel,
			inviter: guildConfigRecord.inviter
		});
	}
}
