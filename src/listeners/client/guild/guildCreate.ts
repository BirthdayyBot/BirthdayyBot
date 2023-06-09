import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { AuditLogEvent, PermissionFlagsBits } from 'discord-api-types/v9';
import { DiscordAPIError, Guild, time, type Snowflake } from 'discord.js';
import { BOT_NAME, BOT_SERVER_LOG, IS_CUSTOM_BOT, SUCCESS } from '../../../helpers/provide/environment';
import { getUserInfo, sendDMMessage, sendMessage } from '../../../lib/discord';
import { GuideEmbed } from '../../../lib/embeds';
import { BotColorEnum } from '../../../lib/enum/BotColor.enum';
import type { EmbedInformationModel } from '../../../lib/model';
import { generateDefaultEmbed } from '../../../lib/utils/embed';

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

		await this.joinServerLog(guild, inviterId);

		async function sendGuide(userId: string) {
			const embed = generateDefaultEmbed(GuideEmbed);
			await sendDMMessage(userId, {
				embeds: [embed],
			});
		}

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

	private async joinServerLog(guild: Guild, inviterId?: Snowflake) {
		const { id: guild_id, name, description, memberCount, ownerId, joinedTimestamp: rawJoinedTimestamp } = guild;
		const joinedTimestamp = time(Math.floor(rawJoinedTimestamp / 1000), 'f');
		const fields = [
			{ name: 'GuildName', value: `${name}` },
			{
				name: 'GuildID',
				value: `${guild_id}`,
			},
		];

		const ownerInfo = await getUserInfo(ownerId);
		const inviterInfo = inviterId ? await getUserInfo(inviterId) : undefined;

		if (description) fields.push({ name: 'GuildDescription', value: `${description}` });
		if (memberCount) fields.push({ name: 'GuildMemberCount', value: `${memberCount}` });
		if (ownerId) fields.push({ name: 'GuildOwner', value: this.generateInfoString(ownerId, ownerInfo?.username) });
		if (inviterId)
			fields.push({ name: 'Inviter', value: this.generateInfoString(inviterId, inviterInfo?.username) });
		if (rawJoinedTimestamp) fields.push({ name: 'GuildJoinedTimestamp', value: `${joinedTimestamp}` });

		const embedObj: EmbedInformationModel = {
			title: `${SUCCESS} ${BOT_NAME} got added to a Guild`,
			description: `I am now in \`${await this.container.botList.computeGuilds()}\` guilds`,
			fields,
			color: BotColorEnum.BIRTHDAYY,
			thumbnail_url: guild.iconURL() ?? undefined,
		};
		const embed = generateDefaultEmbed(embedObj);
		await sendMessage(BOT_SERVER_LOG, { embeds: [embed] });
	}

	private generateInfoString(id: string | undefined, name: string | undefined): string {
		let string = '';
		if (name) string += `Name: ${name}\n`;
		if (id) string += `ID: ${id}\n`;
		return string;
	}
}
