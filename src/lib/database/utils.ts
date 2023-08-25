import type { ConfigName } from './types.js';

export const configNameExtended: Record<ConfigName, string> = {
	birthdayRole: 'Birthday Role',
	birthdayPingRole: 'Birthday Ping Role',
	announcementChannel: 'Announcement Channel',
	announcementMessage: 'Announcement Message',
	overviewChannel: 'Overview Channel',
	overviewMessage: 'Overview Message',
	timezone: 'Timezone',
	logChannel: 'Log Channel',
};

export const configChoices = Object.entries(configNameExtended)
	.map(([name, value]) => ({
		name: value,
		value: name,
	}))
	.sort((a, b) => a.name.localeCompare(b.name));
