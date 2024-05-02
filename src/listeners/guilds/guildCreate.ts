import { sendDMMessage, sendMessage } from '#lib/discord';
import { resolveEmbed } from '#root/commands/General/guide';
import { CLIENT_NAME, BOT_SERVER_LOG, BrandingColors, Emojis, generateDefaultEmbed } from '#utils';
import { getSettings } from '#utils/functions/guilds';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, container, type ListenerOptions } from '@sapphire/framework';
import { AuditLogEvent, Events, Guild, PermissionFlagsBits, time, type Snowflake } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildCreate })
export class UserEvent extends Listener<typeof Events.GuildCreate> {
	public async run(guild: Guild) {
		this.container.client.guildMemberFetchQueue.add(guild.shardId, guild.id);

		container.logger.info(`[EVENT] ${Events.GuildCreate} - ${guild.name} (${guild.id})`);

		const guildId = guild.id;
		const inviterId = await getBotInviter(guild);

		await getSettings(guildId).update({ disabled: false, inviter: inviterId });

		if (inviterId) await sendDMMessage(inviterId, { embeds: await resolveEmbed(guild) });

		await this.joinServerLog(guild, inviterId);

		async function getBotInviter(guildInformation: Guild): Promise<Snowflake | undefined> {
			if (
				!(await guild.members.fetchMe()).permissions.has(
					PermissionFlagsBits.ViewAuditLog || PermissionFlagsBits.Administrator
				)
			) {
				container.logger.debug(
					`[GetBotInviter] ${guildInformation.name} (${guildInformation.id}) - No permission to view audit logs`
				);
				return undefined;
			}

			const auditLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.BotAdd });
			const entry = auditLogs.entries.first();
			const userId = entry?.executor?.id;
			container.logger.debug(`[GetBotInviter] ${guild.name} (${guild.id}) - Inviter: ${userId}`);
			return userId;
		}
	}

	private async joinServerLog(guild: Guild, inviterId?: Snowflake) {
		const { id: guild_id, name, description, memberCount, ownerId, joinedTimestamp: rawJoinedTimestamp } = guild;
		const joinedTimestamp = time(Math.floor(rawJoinedTimestamp / 1000), 'f');
		const fields = [
			{ name: 'GuildName', value: `${name}` },
			{
				name: 'GuildID',
				value: `${guild_id}`
			}
		];

		const ownerInfo = await container.client.users.fetch(ownerId).catch(() => null);
		const inviterInfo = inviterId ? await container.client.users.fetch(inviterId).catch(() => null) : undefined;

		if (description) fields.push({ name: 'GuildDescription', value: `${description}` });
		if (memberCount) fields.push({ name: 'GuildMemberCount', value: `${memberCount}` });
		if (ownerId) fields.push({ name: 'GuildOwner', value: this.generateInfoString(ownerId, ownerInfo?.username) });
		if (inviterId)
			fields.push({ name: 'Inviter', value: this.generateInfoString(inviterId, inviterInfo?.username) });
		if (rawJoinedTimestamp) fields.push({ name: 'GuildJoinedTimestamp', value: `${joinedTimestamp}` });

		const embed = generateDefaultEmbed({
			title: `${Emojis.Success} ${CLIENT_NAME} got added to a Guild`,
			description: `I am now in \`${await this.container.client.computeGuilds()}\` guilds`,
			fields,
			color: BrandingColors.Primary,
			thumbnail: { url: guild.iconURL() ?? '' }
		});
		await sendMessage(BOT_SERVER_LOG, { embeds: [embed] });
	}

	private generateInfoString(id: string | undefined, name: string | undefined): string {
		let string = '';
		if (name) string += `Name: ${name}\n`;
		if (id) string += `ID: ${id}\n`;
		return string;
	}
}
