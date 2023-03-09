import { PermissionFlagsBits } from 'discord.js';

export async function VoteCMD() {
    return {
        name: 'vote',
        description: 'Vote for Birthdayy <3',
        defaultMemberPermissions: [PermissionFlagsBits.ViewChannel], // https://discord.js.org/#/docs/discord.js/v13/typedef/PermissionResolvable
        dmPermission: true,
        options: [],
    };
}
