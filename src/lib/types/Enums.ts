export enum Events {
	AnalyticsSync = 'analyticsSync',
	CommandUsageAnalytics = 'commandUsageAnalytics',
	Error = 'error',
	GuildCreate = 'guildCreate',
	GuildDelete = 'guildDelete',
	MessageCreate = 'messageCreate',
	PostStatsError = 'postStatsError',
	PostStatsSuccess = 'postStatsSuccess',
	ResourceAnalyticsSync = 'resourceAnalyticsSync'
}

export enum PermissionLevels {
	Administrator = 6,
	BotOwner = 10,
	Everyone = 0,
	Manager = 5,
	Moderator = 4,
	ServerOwner = 7
}
