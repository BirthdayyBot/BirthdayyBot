import { PermissionFlagsBits } from 'discord.js';

export async function GuideCMD() {
    return {
        name: 'guide',
        description: 'Need a quick setup Guide! Don\'t worry, this will help you!',
        defaultMemberPermissions: [PermissionFlagsBits.ViewChannel], // https://discord.js.org/#/docs/discord.js/v13/typedef/PermissionResolvable
        dmPermission: true,
        options: [],
    };
}
