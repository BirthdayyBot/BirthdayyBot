export const enum Events {
	PostStatsError = 'postStatsError',
	PostStatsSuccess = 'postStatsSuccess',
}

export const enum PermissionLevels {
	Everyone = 0,
	Moderator = 5,
	Administrator = 6,
	ServerOwner = 7,
	BotOwner = 10,
}
