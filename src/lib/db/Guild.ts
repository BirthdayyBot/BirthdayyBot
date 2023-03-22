import { Prisma } from '@prisma/client';

export const updateGuildsNotInAndBirthdays = (guildID: string|string[], disabled: boolean) => Prisma.validator<Prisma.GuildUpdateArgs>()({
	where: {},
	data: {
		disabled: true,
		birthday: {
			updateMany: {
				...whereGuildsNotIn(guildID),
				data: {
					disabled,
				},
			},
		},
	},
});

export const updateGuildInAndBirthdays = (guildID: string|string[], disabled: boolean) => Prisma.validator<Prisma.GuildUpdateArgs>()({
	where: {},
	data: {
		disabled: false,
		birthday: {
			updateMany: {
				...whereGuildsIn(guildID),
				data: {
					disabled,
				},
			},
		},
	},
});


export const selectGuildAndBirthdays = Prisma.validator<Prisma.GuildFindManyArgs>()({
	select: {
		guild_id: true,
		disabled: true,
		birthday: {
			select: {
				id: true,
				user_id: true,
				birthday: true,
			},
		},
	},
});

export type selectGuildAndBirthdays = Prisma.GuildGetPayload<typeof selectGuildAndBirthdays>;

export const selectGuildPremium = Prisma.validator<Prisma.GuildFindManyArgs>()({
	select: {
		guild_id: true,
		premium: true,
	},
});

export type selectGuildPremium = Prisma.GuildGetPayload<typeof selectGuildPremium>;

export const selectGuildLanguage = Prisma.validator<Prisma.GuildFindManyArgs>()({
	select: {
		guild_id: true,
		language: true,
	},
});

export type selectGuildLanguage = Prisma.GuildGetPayload<typeof selectGuildLanguage>;

export const selectGuildConfig = Prisma.validator<Prisma.GuildFindManyArgs>()({
	select: {
		guild_id: true,
		birthday_role: true,
		birthday_ping_role: true,
		announcement_channel: true,
		announcement_message: true,
		overview_channel: true,
		log_channel: true,
		overview_message: true,
		timezone: true,
		language: true,
		premium: true,
	},
});

export type selectGuildConfig = Prisma.GuildGetPayload<typeof selectGuildConfig>;

export const selectGuildDisabled = Prisma.validator<Prisma.GuildFindManyArgs>()({
	select: {
		guild_id: true,
		disabled: true,
	},
});

export type selectGuildDisabled = Prisma.GuildGetPayload<typeof selectGuildDisabled>;

export const selectGuild = Prisma.validator<Prisma.GuildFindManyArgs>()({
	select: {
		guild_id: true,
	},
});

export type selectGuild = Prisma.GuildGetPayload<typeof selectGuild>;

export const selectGuildTimezone = Prisma.validator<Prisma.GuildFindManyArgs>()({
	select: {
		guild_id: true,
		timezone: true,
	},
});

export type selectGuildTimezone = Prisma.GuildGetPayload<typeof selectGuildTimezone>;

export const whereGuildLastUpdated = (date: Date) => Prisma.validator<Prisma.GuildFindManyArgs>()({
	where: {
		last_updated: {
			lte: date.toISOString(),
		},
		disabled: true,
	},
});

export const whereGuildsNotIn = (guild_id: string|string[]) => Prisma.validator<Prisma.GuildFindManyArgs>()({
	where: {
		guild_id: {
			notIn: guild_id,
		},
	},
});

export const whereGuildsIn = (guild_id: string|string[]) => Prisma.validator<Prisma.GuildFindManyArgs>()({
	where: {
		guild_id: {
			in: guild_id,
		},
	},
});

export const whereGuild = (guild_id: string) => Prisma.validator<Prisma.GuildFindManyArgs>()({
	where: {
		guild_id,
	},
});

export const whereDisableGuild = (guild_id: string, disabled: boolean) => Prisma.validator<Prisma.GuildFindManyArgs>()({
	where: {
		guild_id,
		disabled,
	},
});

export const whereGuildsWithTimezone = (guild_id: string | string[], timezone: string) => Prisma.validator<Prisma.GuildFindManyArgs>()({
	...whereGuildsIn(guild_id),
	where: {
		timezone: parseInt(timezone),
	},
});

