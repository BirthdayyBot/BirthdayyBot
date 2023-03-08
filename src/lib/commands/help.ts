import { PermissionFlagsBits } from 'discord.js';

export async function HelpCMD() {
    return {
        name: 'help',
        description: 'Need help with my Commands?',
        defaultMemberPermissions: [PermissionFlagsBits.ViewChannel], // https://discord.js.org/#/docs/discord.js/v13/typedef/PermissionResolvable
        dmPermission: true,
    };
}
