import { container } from '@sapphire/framework';
import { methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import type { ApiRequest } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';
import type { Birthday } from '@prisma/client';
import { selectGuildTimezone, whereBirthdayWithDate, whereGuildsWithTimezone } from '../../../lib/db';

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

		const birthdays = await this.getBirthdays(date);
		const guildIds = birthdays.map((birthday) => birthday.guild_id);
		const guilds = await this.getGuilds(guildIds, timezone);
		const filteredBirthdays = this.filterBirthdaysByTimezone(birthdays, guilds, timezone);

		if (filteredBirthdays.length === 0) {
			return response.ok({ amount: 0, birthdays: [], message: 'No Birthdays found on that Date and Timezone' });
		}

		return response.ok({ amount: filteredBirthdays.length, birthdays: filteredBirthdays });
	}

	private async getBirthdays(date: string) {
		return container.prisma.birthday.findMany({
			...whereBirthdayWithDate(date),
		});
	}

	private async getGuilds(guildIds: string[], timezone: string) {
		return container.prisma.guild.findMany({
			...whereGuildsWithTimezone(guildIds, timezone),
			...selectGuildTimezone,
		});
	}

	private filterBirthdaysByTimezone(birthdays: Birthday[], guilds: selectGuildTimezone[], timezone: string) {
		return birthdays.filter((birthday) => {
			const guild = guilds.find((g) => g.guild_id === birthday.guild_id);
			return guild?.timezone === parseInt(timezone);
		});
	}
}
