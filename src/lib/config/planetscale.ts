export default {
	database: process.env.DB_NAME,
	username: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	host: process.env.DB_HOST,
	port: '3306',
	logging: false,
	dialect: 'mysql',
	dialectOptions: {
		ssl: {
			require: true,
			rejectUnauthorized: false
		}
	}
};
