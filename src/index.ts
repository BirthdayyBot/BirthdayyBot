import './lib/setup/start.js';

import { BirthdayyClient } from '#lib/BirthdayyClient';
import { container } from '@sapphire/pieces';

const client = new BirthdayyClient();

async function main() {
	try {
		await container.prisma.$connect();
		await client.login();
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
