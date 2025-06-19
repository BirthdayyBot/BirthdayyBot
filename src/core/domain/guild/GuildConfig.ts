export interface GuildConfig {
	id: string;
	announcementChannel?: string | null;
	announcementMessage?: string | null;
	overviewChannel?: string | null;
	overviewMessage?: string | null;
	birthdayRole?: string | null;
	birthdayPingRole?: string | null;
	logChannel?: string | null;
	timezone: string;
	premium: boolean;
	language: string;
	disabled: boolean;
}

export interface GuildConfigCreateInput {
	id: string;
	announcementChannel?: string;
	announcementMessage?: string;
	overviewChannel?: string;
	overviewMessage?: string;
	birthdayRole?: string;
	birthdayPingRole?: string;
	logChannel?: string;
	timezone?: string;
	premium?: boolean;
	language?: string;
}

export interface GuildConfigUpdateInput extends Partial<GuildConfigCreateInput> {
	disabled?: boolean;
}
