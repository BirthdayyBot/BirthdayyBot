import { DiscordAPIError, type RESTJSONErrorCodes } from 'discord.js';
import type { PrismaErrorCodeEnum } from '#lib/types';
import { Prisma } from '@prisma/client';

export async function resolveOnErrorCodesDiscord<T>(promise: Promise<T>, ...codes: readonly RESTJSONErrorCodes[]) {
	try {
		return await promise;
	} catch (error) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		if (error instanceof DiscordAPIError && codes.includes(error.code)) return null;
		throw error;
	}
}

export async function resolveOnErrorCodesPrisma<T>(promise: Promise<T>, ...codes: readonly PrismaErrorCodeEnum[]) {
	try {
		return await promise;
	} catch (error) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		if (error instanceof Prisma.PrismaClientKnownRequestError && codes.includes(error.code)) return null;
		throw error;
	}
}
