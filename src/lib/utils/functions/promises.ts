import type { PrismaErrorCodeEnum } from '#utils/constants';
import { Prisma } from '@prisma/client';
import { container } from '@sapphire/framework';
import { isThenable, type Awaitable } from '@sapphire/utilities';
import { DiscordAPIError, type RESTJSONErrorCodes } from 'discord.js';

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

export function floatPromise(promise: Awaitable<unknown>) {
	if (isThenable(promise)) promise.catch((error: Error) => container.logger.fatal(error));
}

export interface ReferredPromise<T> {
	promise: Promise<T>;
	resolve(value?: T): void;
	reject(error?: Error): void;
}

/**
 * Create a referred promise.
 */
export function createReferPromise<T>(): ReferredPromise<T> {
	let resolve: (value: T) => void;
	let reject: (error?: Error) => void;
	const promise: Promise<T> = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});

	// noinspection JSUnusedAssignment
	return { promise, resolve: resolve!, reject: reject! };
}
