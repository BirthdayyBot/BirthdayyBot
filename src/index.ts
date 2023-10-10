import './lib/setup/start.js';

import { BirthdayyClient } from '#lib/BirthdayyClient';
import { container } from '@sapphire/pieces';
import { floatPromise } from '#utils/functions/promises';
import { getGuildUtilities } from '#utils/functions/guilds';

const client = new BirthdayyClient();

async function main() {
	try {
		await container.prisma.$connect();
		await client.login();
		const guilds = await client.guilds.fetch();

		for (const guild of guilds.values()) {
			const { settings, birthdays } = getGuildUtilities(guild.id);
			container.logger.debug(`[Guild Settings] Fetching settings for ${guild.name} (${guild.id})`);
			floatPromise(settings.fetch());
			container.logger.debug(`[Guild Birthdays] Fetching birthdays for ${guild.name} (${guild.id})`);
			floatPromise(birthdays.fetch());
		}
	} catch (error) {
		container.logger.error(error);
		await container.prisma.$disconnect();
		await client.destroy();
		process.exit(1);
	}
}

main().catch((error) => {
	container.logger.error(error);
});
