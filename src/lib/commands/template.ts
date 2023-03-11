import { PermissionFlagsBits } from 'discord.js';

export async function TemplateCMD() {
    return {
        name: 'template',
        description: 'Template Command',
        defaultMemberPermissions: [PermissionFlagsBits.ViewChannel], // https://discord.js.org/#/docs/discord.js/v13/typedef/PermissionResolvable
        dmPermission: false,
        options: [
            {
                type: 1,
                name: 'test',
                description: 'its a test',
            },
        ],
    };
}
