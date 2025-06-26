import { Identifier } from '../../core/domain/identifier.js';

export const GUILD_CONFIG_IDENTIFIER_TYPE = 'GuildConfigIdentifier';

export class GuildConfigIdentifier extends Identifier<typeof GUILD_CONFIG_IDENTIFIER_TYPE> {}
