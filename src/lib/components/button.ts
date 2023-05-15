import type { APIButtonComponent } from 'discord.js';
import { BIRTHDAYY_INVITE, DISCORD_INVITE, DOCS_URL, WEBSITE_URL } from '../../helpers/provide/environment';

export const discordButton: APIButtonComponent = {
	style: 5,
	label: 'Support Discord',
	url: `${DISCORD_INVITE}`,
	disabled: false,
	type: 2,
	emoji: {
		id: '931267038574432308',
		name: 'people',
		animated: false,
	},
};

export const docsButton: APIButtonComponent = {
	style: 5,
	label: 'Docs',
	url: `${DOCS_URL}`,
	disabled: false,
	type: 2,
	emoji: {
		id: '931267038662504508',
		name: 'book',
		animated: false,
	},
};

export const inviteButton: APIButtonComponent = {
	style: 5,
	label: 'Invite Birthdayy',
	url: `${BIRTHDAYY_INVITE}`,
	disabled: false,
	type: 2,
	emoji: {
		id: '931267039094534175',
		name: 'gift',
		animated: false,
	},
};

export const remindMeButton: APIButtonComponent = {
	style: 3,
	label: '⏰ Remind Me in 12hrs',
	custom_id: 'vote-reminder-button',
	disabled: false,
	type: 2,
};

export const remindMeButtonDisabled: APIButtonComponent = {
	...remindMeButton,
	disabled: true,
};

export const websiteButton: APIButtonComponent = {
	style: 5,
	label: 'Website',
	url: `${WEBSITE_URL}`,
	disabled: false,
	type: 2,
	emoji: {
		id: '931267039019020340',
		name: 'link',
		animated: false,
	},
};
