import { Prisma } from '@prisma/client';
import { extractDayAndMonth } from '../../../helpers/utils/date';


export const findUser = (guild_id: string) => Prisma.validator<Prisma.BirthdayWhereInput>()({
	guild_id,
});

export type T = {
    user_id?: Prisma.StringFilter | string
    guild_id?: Prisma.StringFilter | string
    disabled?: Prisma.BoolFilter | boolean

}

export const whereBirthdayWithDate = (date: string) => Prisma.validator<Prisma.BirthdayFindManyArgs>()({
	where: {
		birthday: {
			contains: extractDayAndMonth(date),
		} },
});


export const selectBirthdayWithUser = Prisma.validator<Prisma.BirthdayFindManyArgs>()({
	select: {
		id: true,
		user_id: true,
		birthday: true,
		user: {
			select: {
				username: true,
				discriminator: true,
			},
		},
		guild_id: true,
	},
});


export type BirthdayWithUserModel = Prisma.BirthdayGetPayload<typeof selectBirthdayWithUser>;

export const whereBithdayWithUserAndGuild = (user_id: string, guild_id: string) => Prisma.validator<Prisma.BirthdayFindUniqueArgs>()({
	where: {
		user_id_guild_id: {
			user_id,
			guild_id,
		},
	},
});

export const whereBirthdaysWitUser = (user_id: string) => Prisma.validator<Prisma.BirthdayFindManyArgs>()({
	where: {
		user_id,
	},
});

