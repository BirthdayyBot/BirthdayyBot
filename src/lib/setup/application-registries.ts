import { ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import { envParseString } from '@skyra/env-utilities';

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
ApplicationCommandRegistries.setDefaultGuildIds([envParseString('CLIENT_MAIN_GUILD')]);
