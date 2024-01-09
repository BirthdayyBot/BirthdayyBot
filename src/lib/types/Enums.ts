export enum Events {
	AnalyticsSync = 'analyticsSync',
	CommandUsageAnalytics = 'commandUsageAnalytics',
	PostStatsError = 'postStatsError',
	PostStatsSuccess = 'postStatsSuccess',
	MessageCreate = 'messageCreate',
	GuildCreate = 'guildCreate',
	GuildDelete = 'guildDelete',
	ResourceAnalyticsSync = 'resourceAnalyticsSync',
}

export enum PermissionLevels {
	Everyone = 0,
	Moderator = 4,
	Manager = 5,
	Administrator = 6,
	ServerOwner = 7,
	BotOwner = 10,
}
