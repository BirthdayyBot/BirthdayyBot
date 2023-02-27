import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, ListenerOptions, container } from '@sapphire/framework';
import { AuditLogEvent, Guild, PermissionFlagsBits } from 'discord.js';
import { AUTOCODE_ENV, DEBUG, IS_CUSTOM_BOT } from '../helpers/provide/environment';
import { sendDMMessage } from '../lib/discord/message';
import { GuideEmbed } from '../lib/embeds';
import generateEmbed from '../helpers/generate/embed';
import { isGuildDisabled } from '../helpers/provide/guild';
const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			once: true,
			event: Events.GuildCreate,
			enabled: true
		});
	}
	public async run(guild: Guild) {
		console.log(`[EVENT] ${Events.GuildCreate} - ${guild.name} (${guild.id})`);
		const guild_id = guild.id;
		const inviter = await getBotInviter(guild);
		if (IS_CUSTOM_BOT) {
			//TODO: #26 Create a nice welcome message for custom bot servers
		}
		await createNewGuild();
		if (inviter) {
			await sendGuide(inviter);
		}
		return;

		async function createNewGuild() {
			const alreadyExists: boolean = await isGuildDisabled(guild_id);
			if (alreadyExists) {
				//set guild and birthdayy to enabled
                
			} else {
				//create new guild
                //TODO: Before releasing to production, publish the autocode api dev to release
                return await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.create({
                    guild_id: guild_id,
                    inviter: inviter
                });
			}
		}

		async function sendGuide(user_id: string) {
			const embed = await generateEmbed(GuideEmbed);
			await sendDMMessage(user_id, {
				embeds: [embed]
			});
		}

		async function getBotInviter(guild: Guild): Promise<string | null> {
			if (!guild.members.me!.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
				DEBUG ? container.logger.debug(`[GetBotInviter] ${guild.name} (${guild.id}) - No permission to view audit logs`) : null;
				return null;
			}

			try {
				const auditLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.BotAdd });
				const entry = auditLogs.entries.first();
				const inviter = entry!.executor!.id;
				DEBUG ? container.logger.debug(`[GetBotInviter] ${guild.name} (${guild.id}) - Inviter: ${inviter}`) : null;
				return inviter;
			} catch (error) {
				return null;
			}
		}
	}
}
