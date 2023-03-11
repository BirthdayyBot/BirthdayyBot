import { container } from '@sapphire/framework';
import cron from 'node-cron';

export default async function testScheduler(): Promise<Promise<cron.ScheduledTask>> {
    // run function xyz every minute
    return cron.schedule('0 * * * * *', async () => {
        try {
            container.logger.info('testScheduler');
        } catch (error) {
            container.logger.error(`Error running async task: ${error}`);
        }
    });
}
