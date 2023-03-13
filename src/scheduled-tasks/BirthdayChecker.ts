import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { getCurrentOffset } from '../helpers/provide/currentOffset';
import { APP_ENV, DEBUG } from '../helpers/provide/environment';
import { getBirthdaysByDateAndTimezone } from '../lib/birthday/birthday';
import birthdayEvent from '../lib/birthday/birthdayEvent';

@ApplyOptions<ScheduledTask.Options>({ name: 'BirthdayChecker', pattern: '0 * * * *' })
export class BirthdayCheckerTask extends ScheduledTask {
    public async run() {
        const { date: today, offsetString: offset } = await getCurrentOffset();
        let todaysBirthdays = [{ id: 1342, user_id: '1063411719906529323', birthday: '2001-05-21', guild_id: '766707453994729532' }];

        if (APP_ENV === 'prd') {
            const { birthdays } = await getBirthdaysByDateAndTimezone(today, offset);
            todaysBirthdays = birthdays;
        }

        const birthdayCount = todaysBirthdays.length;
        if (DEBUG) this.container.logger.info('birthdayCount', todaysBirthdays.length);

        if (birthdayCount <= 0) return this.container.logger.info(`[Task] No Birthdays Today. Date: ${today}, offset: ${offset}`);

        for (const birthday of todaysBirthdays) {
            if (DEBUG) this.container.logger.info(`[Task] BIRTHDAYY LOOP: ${birthday.id}`);
            await birthdayEvent(birthday.guild_id, birthday.user_id, false);
        }
    }
}
