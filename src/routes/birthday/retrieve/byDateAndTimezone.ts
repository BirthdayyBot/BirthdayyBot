import { type ApiResponse, methods, Route } from '@sapphire/plugin-api';
import type { ApiRequest } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';
import type { Birthday, Guild } from '@prisma/client';
import dayjs from 'dayjs';

type Query = {
	date: string;
	timezone: string;
};

@ApplyOptions<Route.Options>({ route: 'birthday/retrieve/byDateAndTimezone' })
export class UserRoute extends Route {
	@authenticated()
	@validateParams<Query>()
	public async [methods.GET](request: ApiRequest<Query>, response: ApiResponse) {
		const { date, timezone } = request.query;

		const birthdays = await this.container.utilities.birthday.get.BirthdaysByDate(dayjs(date));
		const guildIds = birthdays.map((birthday) => birthday.guildId);
		const guilds = await this.container.utilities.guild.get.GuildsByTimezone(guildIds, parseInt(timezone));
		const filteredBirthdays = this.filterBirthdaysByTimezone(birthdays, guilds, timezone);

		if (filteredBirthdays.length === 0) {
			return response.ok({ amount: 0, birthdays: [], message: 'No Birthdays found on that Date and Timezone' });
		}

		return response.ok({ amount: filteredBirthdays.length, birthdays: filteredBirthdays });
	}

	private filterBirthdaysByTimezone(birthdays: Birthday[], guilds: Guild[], timezone: string) {
		return birthdays.filter((birthday) => {
			const guild = guilds.find((g) => g.guildId === birthday.guildId);
			return guild?.timezone === parseInt(timezone);
		});
	}
}
