import { Sequelize } from 'sequelize';
import { container } from '@sapphire/framework';

container.sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USERNAME!, process.env.DB_PASSWORD!, {
    host: process.env.DB_HOST,
	logging: false,
	dialect: 'mysql',
	dialectOptions: {
		ssl: {
			require: true,
			rejectUnauthorized: false
		}
	}
});

const connectToPlanetscale = async () => {
	try {
		await container.sequelize.authenticate();
		container.logger.info('Connection has been established successfully.');
	} catch (error) {
		container.logger.fatal('Unable to connect to the database:', error);
	}
};

connectToPlanetscale();

declare module '@sapphire/pieces' {
	interface Container {
		sequelize: Sequelize;
	}
}
