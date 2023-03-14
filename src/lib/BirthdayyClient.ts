import { container, SapphireClient } from '@sapphire/framework';
import { Sequelize } from 'sequelize';
import { DB_OPTIONS, CLIENT_OPTIONS } from '../config';

export class BirthdayyClient extends SapphireClient {
    public constructor() {
        super(CLIENT_OPTIONS);

        container.sequelize = new Sequelize(DB_OPTIONS);
    }

    public async login(token?: string): Promise<string> {
        try {
            await container.sequelize.authenticate();
            return super.login(token);
        } catch (error) {
            container.logger.error(error);
            await this.destroy();
            process.exit(1);
        }
    }

    public async destroy() {
        try {
            await Promise.all([container.sequelize.close(), super.destroy()]);
            process.exit(1);
        } catch (error) {
            container.logger.error(error);
            process.exit(1);
        }
    }
}