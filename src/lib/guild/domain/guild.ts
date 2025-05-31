import type { Birthday } from '#lib/birthday/domain/birthday';
import { Entity } from '#lib/core/domain/entity';

interface Properties {
	id: string;
	inviter: string | null;
	announcementChannelId: string | null;
	announcementMessageId: string | null;
	overviewChannelId: string | null;
	overviewMessageId: string | null;
	birthdayRoleId: string | null;
	birthdayPingRoleId: string | null;
	logChannelId: string | null;
	timezone: string | null;
	createdAt: Date;
	updatedAt: Date;
	disabled: boolean;
	birthday: Birthday[];
}

export class Guild extends Entity<Properties> {
	public static create(properties: Properties): Guild {
		return new this(properties);
	}
}
