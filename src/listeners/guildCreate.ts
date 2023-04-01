import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener, ListenerOptions } from '@sapphire/framework';
import { DEBUG, IS_CUSTOM_BOT } from '../helpers/provide/environment';
import { sendDMMessage } from '../lib/discord/message';
import { GuideEmbed } from '../lib/embeds';
import generateEmbed from '../helpers/generate/embed';
import joinServerLog from '../helpers/send/joinServerLog';
import type { Guild } from 'discord.js';
import { AuditLogEvent, PermissionFlagsBits } from 'discord-api-types/v9';

@ApplyOptions<ListenerOptions>({ event: Events.GuildCreate })
export class UserEvent extends Listener<typeof Events.GuildCreate> {
	public async run(guild: Guild) {
		container.logger.info(`[EVENT] ${Events.GuildCreate} - ${guild.name} (${guild.id})`);
		DEBUG ? container.logger.debug(`[GuildCreate] - ${guild}`) : null;
		const guildId = guild.id;
		const inviter = await getBotInviter(guild);
		if (IS_CUSTOM_BOT) {
			// TODO: #26 Create a nice welcome message for custom bot servers
		}
		const _guild = await this.container.utilities.guild.get.GuildById(guildId);

		if (!_guild) await this.container.utilities.guild.create({ guildId, inviter });
		else await container.utilities.guild.update.DisableGuildAndBirthdays(guildId, false);

		if (inviter) {
			await sendGuide(inviter);
		}
		await joinServerLog(guild);
		return;

		async function sendGuide(user_id: string) {
			const embed = await generateEmbed(GuideEmbed);
			await sendDMMessage(user_id, {
				embeds: [embed],
			});
		}

		async function getBotInviter(guildInformation: Guild): Promise<string | null> {
			if (!(await guild.members.fetchMe()).permissions.has(PermissionFlagsBits.ViewAuditLog)) {
				container.logger.debug(
					DEBUG ? `[GetBotInviter] ${guildInformation.name} (${guildInformation.id}) - No permission to view audit logs` : '',
				);

				return null;
			}

			try {
				const auditLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.BotAdd });
				const entry = auditLogs.entries.first();
				const inviterID = entry!.executor!.id;
				DEBUG ? container.logger.debug(`[GetBotInviter] ${guild.name} (${guild.id}) - Inviter: ${inviterID}`) : null;
				return inviter;
			} catch (error) {
				return null;
			}
		}
	}
}
