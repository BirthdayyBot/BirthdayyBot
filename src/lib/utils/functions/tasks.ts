import { Time } from '@sapphire/duration';
import { container } from '@sapphire/framework';

export async function checkGuildDeleteQueue(guildId: string) {
	const currentTask = await container.tasks.list({ types: ['delayed'] });
	if (!currentTask) return null;
	return currentTask.find((t) => t.data === guildId)?.id ?? null;
}

export async function createGuildDeleteQueue(guildId: string) {
	const task = await container.tasks.create(
		{ name: 'deleteGuild', payload: guildId },
		{ delay: Time.Day, repeated: false },
	);
	return task?.id ?? null;
}

export async function deleteTaskById(taskId: string) {
	return container.tasks.delete(taskId);
}
