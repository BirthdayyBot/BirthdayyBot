import { container, SapphireClient } from '@sapphire/framework';
import { getRootData } from '@sapphire/pieces';
import { join } from 'path';
import { CLIENT_OPTIONS } from '../config';
import { PrismaClient } from '@prisma/client';

export class BirthdayyClient extends SapphireClient {
	public constructor() {
		super(CLIENT_OPTIONS);

		container.prisma = new PrismaClient();

		this.registerPaths();
	}

	private registerPaths() {
		this.stores.get('scheduled-tasks').registerPath(join(getRootData().root, 'tasks'));
	}
}
