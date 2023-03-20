import { Prisma } from '@prisma/client';

export const createUser = (
	user_id: string,
	username: string,
	discriminator: string,
) => {
	return Prisma.validator<Prisma.UserCreateInput>()({
		user_id,
		username,
		discriminator,
	});
};

export const createUserAndBirthday = (
	user_id: string,
	username: string,
	discriminator: string,
	birthday: string,
	guild_id: string,
) => {
	return Prisma.validator<Prisma.UserCreateInput>()({
		user_id,
		username,
		discriminator,
		birthday: {
			create: {
				birthday,
				guild_id,
			},
		},
	});
};


export const findSpecificUser = (userID: string) => {
	return Prisma.validator<Prisma.UserWhereInput>()({
		user_id: userID,
	});
};