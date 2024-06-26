export enum Events {
	AnalyticsSync = 'analyticsSync',
	CommandUsageAnalytics = 'commandUsageAnalytics',
	Error = 'error',
	PostStatsError = 'postStatsError',
	PostStatsSuccess = 'postStatsSuccess',
	MessageCreate = 'messageCreate',
	GuildCreate = 'guildCreate',
	GuildDelete = 'guildDelete',
	GuildDeleteLogs = 'rawGuildDeleteLogs',
	ResourceAnalyticsSync = 'resourceAnalyticsSync'
}

export enum PermissionLevels {
	Everyone = 0,
	Moderator = 5,
	Administrator = 6,
	ServerOwner = 7,
	BotOwner = 10
}
