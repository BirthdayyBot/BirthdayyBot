import { container, SapphireClient } from '@sapphire/framework';
import { getRootData } from '@sapphire/pieces';
import { join } from 'path';
import { Sequelize } from 'sequelize';
import { DB_OPTIONS, CLIENT_OPTIONS } from '../config';

export class BirthdayyClient extends SapphireClient {
	public constructor() {
		super(CLIENT_OPTIONS);

		container.sequelize = new Sequelize(DB_OPTIONS);

		this.registerPaths();
	}

	private registerPaths() {
		this.stores.get('scheduled-tasks').registerPath(join(getRootData().root, 'tasks'));
	}
}
