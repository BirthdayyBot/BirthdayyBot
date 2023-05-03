import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { getVoiceChannel } from '../lib/discord';
import { ChannelIdEnum } from '../lib/enum/ChannelId.enum';
import { isProduction } from '../lib/utils/env';

@ApplyOptions<ScheduledTask.Options>({
	name: 'DisplayStats',
	enabled: isProduction,
	pattern: '0 * * * *',
})
export class DisplayStats extends ScheduledTask {
	public async run() {
		const guilds = await this.container.botList.computeGuilds();
		const users = await this.container.botList.computeUsers();
		const serverCountChannel = await getVoiceChannel(ChannelIdEnum.GUILD_STATS_CHANNEL);
		const userCountChannel = await getVoiceChannel(ChannelIdEnum.USER_STATS_CHANNEL);

		await serverCountChannel?.setName(`Servers: ${guilds} 🍰`);
		await userCountChannel?.setName(`Users: ${users} 👥`);
	}
}
