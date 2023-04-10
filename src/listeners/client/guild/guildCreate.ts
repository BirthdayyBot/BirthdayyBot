import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener, ListenerOptions } from '@sapphire/framework';
import { AuditLogEvent, PermissionFlagsBits } from 'discord-api-types/v9';
import { DiscordAPIError, Guild, Snowflake } from 'discord.js';
import generateEmbed from '../../../helpers/generate/embed';
import { IS_CUSTOM_BOT } from '../../../helpers/provide/environment';
import joinServerLog from '../../../helpers/send/joinServerLog';
import { sendDMMessage } from '../../../lib/discord';
import { GuideEmbed } from '../../../lib/embeds';

@ApplyOptions<ListenerOptions>({ event: Events.GuildCreate })
export class UserEvent extends Listener<typeof Events.GuildCreate> {
	public async run(guild: Guild) {
		container.logger.info(`[EVENT] ${Events.GuildCreate} - ${guild.name} (${guild.id})`);
		container.logger.debug(`[GuildCreate] - ${guild.id} ${guild.name}`);
		const guildId = guild.id;
		const inviterId = await getBotInviter(guild);
		if (IS_CUSTOM_BOT) {
			// TODO: #26 Create a nice welcome message for custom bot servers
		}

		const guildData = await this.container.utilities.guild.get.GuildById(guildId);

		if (!guildData) {
			await this.container.utilities.guild.create({ guildId, inviter: inviterId });
		}

		await container.utilities.guild.update.DisableGuildAndBirthdays(guildId, false);

		if (inviterId) {
			await sendGuide(inviterId);
		}

		await joinServerLog(guild, inviterId);

		async function sendGuide(userId: string) {
			const embed = generateEmbed(GuideEmbed);
			await sendDMMessage(userId, {
				embeds: [embed],
			});
		}

		await this.container.tasks.run('PostStats', {});

		async function getBotInviter(guildInformation: Guild): Promise<Snowflake | undefined> {
			if (
				!(await guild.members.fetchMe()).permissions.has(
					PermissionFlagsBits.ViewAuditLog || PermissionFlagsBits.Administrator,
				)
			) {
				container.logger.debug(
					`[GetBotInviter] ${guildInformation.name} (${guildInformation.id}) - No permission to view audit logs`,
				);
				return undefined;
			}

			try {
				const auditLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.BotAdd });
				const entry = auditLogs.entries.first();
				const userId = entry!.executor!.id;
				container.logger.debug(`[GetBotInviter] ${guild.name} (${guild.id}) - Inviter: ${userId}`);
				return userId;
			} catch (error) {
				if (error instanceof DiscordAPIError) {
					container.logger.error(`[GetBotInviter] ${guild.name} (${guild.id}) - ${error.message}`);
					return undefined;
				}
				return undefined;
			}
		}
	}
}
