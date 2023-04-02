import { container, SapphireClient } from '@sapphire/framework';
import { getRootData } from '@sapphire/pieces';
import { join } from 'path';
import { CLIENT_OPTIONS, WEBHOOK_ERROR } from '../config';
import { PrismaClient } from '@prisma/client';
import { WebhookClient } from 'discord.js';

export class BirthdayyClient extends SapphireClient {
	public constructor() {
		super(CLIENT_OPTIONS);

		container.prisma = new PrismaClient();
		container.webhook = WEBHOOK_ERROR ? new WebhookClient(WEBHOOK_ERROR) : null;
		this.registerPaths();
	}

	private registerPaths() {
		this.stores.get('scheduled-tasks').registerPath(join(getRootData().root, 'tasks'));
	}
}
