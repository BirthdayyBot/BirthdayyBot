import type { TimestampedEntity } from '#domain/entities/base/timestamped_entity';
import type { GuildConfig } from '#domain/entities/guild/guild-config';
import type { Repository } from '#domain/repositories/base_repository';
import type { GuildConfigRepository } from '#domain/repositories/guild-config_repository';
import type { Guild, PrismaClient } from '@prisma/client';

export class PrismaGuildConfigRepository implements GuildConfigRepository {
	public constructor(private readonly prisma: PrismaClient) {}

	public async findById(id: string): Promise<GuildConfig | null> {
		const guild = await this.prisma.guild.findUnique({ where: { id } });
		return guild ? this.toDomainEntity(guild) : null;
	}

	public async findOrCreate(
		id: string,
		data: Repository.CreateData<GuildConfig> | Partial<Omit<GuildConfig, 'id' | keyof TimestampedEntity>>
	): Promise<GuildConfig> {
		const guild = await this.prisma.guild.upsert({
			where: { id },
			update: data,
			create: { id, ...data }
		});
		return this.toDomainEntity(guild);
	}

	public async update(id: string, data: Repository.UpdateData<GuildConfig>): Promise<GuildConfig | null> {
		const payload = { where: { id }, data };
		const updated = await this.prisma.guild.update(payload).catch(() => null);
		return updated ? this.toDomainEntity(updated) : null;
	}

	public async deleteById(id: string): Promise<void> {
		await this.prisma.guild.delete({ where: { id } }).catch(() => {});
	}

	public async createMany(entities: Repository.CreateData<GuildConfig>[]): Promise<GuildConfig[]> {
		const created = await this.prisma.guild.createManyAndReturn({
			data: entities,
			skipDuplicates: true
		});
		return created.map(this.toDomainEntity);
	}

	public async count(): Promise<number> {
		return this.prisma.guild.count();
	}

	public async findAll(): Promise<GuildConfig[]> {
		const guilds = await this.prisma.guild.findMany();
		return guilds.map(this.toDomainEntity);
	}

	private toDomainEntity = (data: Guild): GuildConfig => ({
		id: data.id,
		inviter: data.inviter ?? undefined,
		announcementChannel: data.announcementChannel ?? undefined,
		announcementMessage: data.announcementMessage ?? undefined,
		overviewChannel: data.overviewChannel ?? undefined,
		overviewMessage: data.overviewMessage ?? undefined,
		birthdayRole: data.birthdayRole ?? undefined,
		birthdayPingRole: data.birthdayPingRole ?? undefined,
		logChannel: data.logChannel ?? undefined,
		language: data.language,
		timezone: data.timezone,
		premium: data.premium,
		disabled: data.disabled ?? false,
		createdAt: data.createdAt,
		updatedAt: data.updatedAt
	});
}
