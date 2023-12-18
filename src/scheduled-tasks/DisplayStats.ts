import { getVoiceChannel } from '#lib/discord/channel';
import { isProduction, isCustom, isDevelopment } from '#utils/env';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';

@ApplyOptions<ScheduledTask.Options>({
	name: 'DisplayStats',
	enabled: isProduction,
	pattern: '0 * * * *',
})
export class DisplayStats extends ScheduledTask {
	public async run() {
		if (isCustom || isDevelopment) return container.logger.error('DisplayStats task is disabled.');
		const guilds = await container.botList.computeGuilds();
		const users = await container.botList.computeUsers();
		const serverCountChannel = await getVoiceChannel('951246486279172106');
		const userCountChannel = await getVoiceChannel('1103307353320865832');

		await serverCountChannel?.setName(`Servers: ${guilds} 🍰`);
		await userCountChannel?.setName(`Users: ${users} 👥`);
	}
}
