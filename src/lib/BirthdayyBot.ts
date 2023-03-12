import { container, SapphireClient } from '@sapphire/framework';
import { Sequelize } from 'sequelize';
import { BD_OPTIONS, CLIENT_OPTIONS } from '../config';

export class BirthdayyBot extends SapphireClient {
    public constructor() {
        super(CLIENT_OPTIONS);

        container.db = new Sequelize(BD_OPTIONS);
    }

    public async login(token?: string) {
        return super.login(token);
    }

    public async destroy() {
        return super.destroy();
    }
}