import type { Birthday } from '#root/core/domain/entites/birthday';

export interface GuildConfig {
	id: string;
	inviter: string;
	announcementChannel?: string;
	announcementMessage?: string;
	overviewChannel?: string;
	overviewMessage?: string;
	birthdayRole?: string;
	birthdayPingRole?: string;
	logChannel?: string;
	timezone: string;
	premium: boolean;
	language: string;
	createdAt: Date;
	updatedAt: Date;
	disabled: boolean;

	birthday?: Birthday[];
}
