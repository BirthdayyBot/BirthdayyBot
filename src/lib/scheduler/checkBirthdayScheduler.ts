const cron = require('node-cron');
import { container } from '@sapphire/framework';
import checkCurrentBirthdays from '../birthday/checkCurrentBirthdays';

export default async function checkBirthdayScheduler(): Promise<void> {
	//run function xyz every hour at 0 minutes
	return cron.schedule('0 * * * *', async () => {
		try {
			container.logger.info('checked Birthday Scheduler');
			await checkCurrentBirthdays();
		} catch (error) {
			console.error(`Error running async task: ${error}`);
		}
	});
}
