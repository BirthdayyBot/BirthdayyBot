import type { APIButtonComponent } from 'discord.js';

export const remindMeButton: APIButtonComponent = {
	style: 3,
	label: '⏰ Remind Me in 12hrs',
	custom_id: 'remind-me-to-vote',
	disabled: false,
	type: 2,
};

export const remindMeButtonDisabled: APIButtonComponent = {
	...remindMeButton,
	disabled: true,
};
