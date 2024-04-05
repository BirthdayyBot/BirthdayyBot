import { Time } from '@sapphire/duration';
import { container } from '@sapphire/framework';
import { Job } from 'bullmq';

export async function findGuildDeleteQueue(guildId: string) {
	const currentTask = await container.tasks.list({ types: ['waiting'] });
	if (!currentTask) return null;
	return currentTask.find((t) => t.data === guildId) ?? null;
}

export async function createGuildDeleteQueue(guildId: string) {
	return container.tasks.create({ name: 'deleteGuild', payload: guildId }, { delay: Time.Day, repeated: false });
}

export async function changeGuildDeleteQueueDelay(task: Job) {
	const newDelay = Time.Day + task.delay;
	return task.changeDelay(newDelay);
}

export async function deleteTaskById(taskId: string) {
	return container.tasks.delete(taskId);
}
