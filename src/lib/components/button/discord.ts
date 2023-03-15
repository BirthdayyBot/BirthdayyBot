import { DISCORD_INVITE } from '../../../helpers/provide/environment';

export const discordButton = {
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
