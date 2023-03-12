import { ARROW_RIGHT, HEART, PLUS, PREMIUM_URL } from '../../helpers/provide/environment';
import { VoteSites } from '../db/voteSites';

export const VoteEmbed = {
    title: `${HEART} Support Birthdayy`,
    description: '',
    fields: [
        {
            name: 'Vote for Birthdayy',
            value: VoteSites.map(({ name, url }) => `${ARROW_RIGHT} [${name}](${url})\n`).join(''),
            inline: false,
        },
        {
            name: 'Birthdayy Premium',
            value: `${ARROW_RIGHT} Support the Project and get access to beta features\n${PLUS} [Birthdayy Patreon](${PREMIUM_URL})`,
            inline: false,
        },
    ],
};
