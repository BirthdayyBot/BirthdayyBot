import { GuildIDEnum } from '#utils/constants';
import { isProduction } from '#utils/env';
import { ApplyOptions } from '@sapphire/decorators';
import { isVoiceBasedChannel } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';

@ApplyOptions<ScheduledTask.Options>({
	name: 'DisplayStats',
	enabled: isProduction,
	pattern: '0 * * * *'
})
export class DisplayStats extends ScheduledTask {
	private readonly serverChannelID = '951246486279172106';
	private readonly userChannelID = '1103307353320865832';

	public async run() {
		const guild = await container.client.guilds.fetch(GuildIDEnum.Birthdayy);

		const serverCountChannel = await guild.channels.fetch(this.serverChannelID);
		const userCountChannel = await guild.channels.fetch(this.userChannelID);

		if (!isVoiceBasedChannel(serverCountChannel) || !isVoiceBasedChannel(userCountChannel)) {
			return container.logger.error('[DisplayStats] Server or User count channel not found.');
		}

		await serverCountChannel?.setName(`Servers: ${await container.client.computeGuilds()} 🍰`);
		await userCountChannel?.setName(`Users: ${await container.client.computeUsers()} 👥`);
	}
}
