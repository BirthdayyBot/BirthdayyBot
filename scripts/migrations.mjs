import { promises as fs } from 'fs';

async function main() {}

async function migrateBirthday() {
	const birthdayPath = path.join(__dirname, 'migrations/birthday.json');
	const req = await checkAccess(birthdayPath);

	if (!req.success) throw new Error(req.error);

	const rawData = await fs.readFile(birthdayPath, 'utf-8');
	const birthdays = rawData.length ? JSON.parse(rawData) : [];

	const newBirthday = birthdays.map((birthday) => {
		const [year, month, day] = birthday.birthday.split('-');

		return {
			user_id: birthday.user_id,
			in_delete_queue: birthday.disabled === 1 ? true : false,
			guild_id: birthday.guild_id,
			year: year === 'XXXX' ? null : year,
			month,
			day,
			update_at: new Date(),
			created_at: new Date()
		};
	});

	const newBirthdayPath = path.join(__dirname, 'migrations/newBirthday.json');
	await fs.writeFile(newBirthdayPath, JSON.stringify(newBirthday, null, 2), 'utf-8');

	console.log('Migration done.');
}

async function migrateGuilds() {
	const guildsPath = path.join(__dirname, 'migrations/guilds.json');
	const req = await checkAccess(guildsPath);

	if (!req.success) throw new Error(req.error);

	const rawData = await fs.readFile(guildsPath, 'utf-8');
	const guilds = rawData.length ? JSON.parse(rawData) : [];

	const newGuilds = guilds.map((guild) => {
		return {
			inviter: guild.inviter,
			id: guild.guild_id,
			'channels.announcement': guild.announcement_channel,
			'channels.logs': guild.log_channel,
			'channels.overview': guild.overview_channel,
			language: guild.language,
			premium: guild.premium,
			timezone: guild.timezone,
			in_delete_queue: guild.disabled === 1 ? true : false,
			'messages.announcement': guild.announcement_message,
			'messages.overview': guild.overview_message,
			'roles.birthday': guild.birthday_role,
			'roles.notified': guild.birthday_ping_role,
			created_at: new Date(),
			updated_at: new Date()
		};
	});
}

async function checkAccess(path) {
	try {
		await fs.access(path, fsConstants.R_OK | fsConstants.W_OK);
		return { success: true };
	} catch (error) {
		console.log('Missing access', error);
		return { success: false, error: `Il semblerait que le fichier soit inaccessible ou inexistant.` };
	}
}

await main();
