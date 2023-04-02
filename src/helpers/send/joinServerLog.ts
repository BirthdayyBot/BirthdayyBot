import { Guild, Snowflake, time } from 'discord.js';
import { sendMessage } from '../../lib/discord/message';
import { getUserInfo } from '../../lib/discord/user';
import { BotColorEnum } from '../../lib/enum/BotColor.enum';
import type { EmbedInformationModel } from '../../lib/model/EmbedInformation.model';
import generateEmbed from '../generate/embed';
import { BOT_NAME, BOT_SERVER_LOG, SUCCESS } from '../provide/environment';
import getGuildCount from '../provide/guildCount';

export default async function joinServerLog(guild: Guild, inviterId?: Snowflake) {
	const server_count = getGuildCount();
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
	if (ownerId) fields.push({ name: 'GuildOwner', value: generateInfoString(ownerId, ownerInfo?.username) });
	if (inviterId) fields.push({ name: 'Inviter', value: generateInfoString(inviterId, inviterInfo?.username) });
	if (rawJoinedTimestamp) fields.push({ name: 'GuildJoinedTimestamp', value: `${joinedTimestamp}` });

	const embedObj: EmbedInformationModel = {
		title: `${SUCCESS} ${BOT_NAME} got added to a Guild`,
		description: `I am now in \`${server_count}\` guilds`,
		fields,
		color: BotColorEnum.BIRTHDAYY,
		thumbnail_url: guild.iconURL() ?? undefined,
	};
	const embed = generateEmbed(embedObj);
	await sendMessage(BOT_SERVER_LOG, { embeds: [embed] });
}

function generateInfoString(id: string | undefined, name: string | undefined): string {
	let string = '';
	if (name) string += `Name: ${name}\n`;
	if (id) string += `ID: ${id}\n`;
	return string;
}
