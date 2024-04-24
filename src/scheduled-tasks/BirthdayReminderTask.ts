import { TaskBirthdayData, getAge } from '#lib/birthday';
import { DEFAULT_ANNOUNCEMENT_MESSAGE } from '#utils/environment';
import { Birthday } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendMessages } from '@sapphire/discord.js-utilities';
import { Time } from '@sapphire/duration';
import { container } from '@sapphire/pieces';
import { TFunction, fetchT } from '@sapphire/plugin-i18next';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { Nullish, isNullish } from '@sapphire/utilities';
import { GuildMember, TextChannel, User } from 'discord.js';

const enum Matches {
	Age = '{age}',
	AgeOrdinal = '{age.ordinal}',
	User = '{user}',
	UserName = '{user.name}',
	UserTag = '{user.tag}'
}

const enum PartResult {
	NotSet,
	Invalid,
	Success
}

@ApplyOptions<ScheduledTask.Options>({ name: 'BirthdayReminderTask', pattern: '0 * * * *' })
export class BirthdayReminderTask extends ScheduledTask {
	private kTransformMessageRegExp = /{age}|{age\.ordinal}|{user}|{user\.name}|{user\.tag}/g;

	public async run(guildId: string) {
		const guildDiscord = this.container.client.guilds.cache.get(guildId);
		if (!guildDiscord) return null;

		const { channelsAnnouncement, messagesAnnouncement, rolesBirthday } = await container.prisma.guild.findUniqueOrThrow({
			where: { id: guildId }
		});

		if (!this.isCorrectlyConfigured(rolesBirthday, channelsAnnouncement)) return null;

		const birthdays = await container.prisma.birthday.findMany({
			where: { day: { not: null }, guildId, month: { not: null } }
		});

		for (const birthday of birthdays) {
			const member = await guildDiscord.members.fetch(birthday.userId);
			if (!member) return null;
			await Promise.all([
				this.handleRole(member, rolesBirthday),
				this.handleMessage(
					birthday,
					member,
					channelsAnnouncement,
					messagesAnnouncement ?? DEFAULT_ANNOUNCEMENT_MESSAGE,
					await fetchT(guildDiscord)
				)
			]);
		}

		return null;
	}

	private async addBirthdayRole(member: GuildMember, birthdayRole: string) {
		await member.roles.add(birthdayRole);
		await this.container.tasks.create(
			{
				name: 'RemoveBirthdayRole',
				payload: {
					guildID: member.guild.id,
					roleID: birthdayRole,
					userID: member.user.id
				}
			},
			{ delay: Time.Day, repeated: false }
		);
	}

	private async handleMessage(
		birthday: Birthday,
		member: GuildMember,
		channelId: Nullish | string,
		content: Nullish | string,
		t: TFunction
	): Promise<PartResult> {
		if (isNullish(channelId) || isNullish(content)) return PartResult.NotSet;

		const channel = member.guild.channels.cache.get(channelId) as TextChannel | undefined;

		// If the channel doesn't exist anymore, reset:
		if (!channel) {
			await container.prisma.guild.update({
				data: { channelsAnnouncement: null },
				where: { id: member.guild.id }
			});
			return PartResult.Invalid;
		}

		// If the channel is postable, send the message:
		if (canSendMessages(channel)) {
			await channel.send({
				allowedMentions: { users: [member.id] },
				content: this.transformMessage(content, member.user, getAge({ day: birthday.day!, month: birthday.month!, year: birthday.year }), t)
			});
		}

		return PartResult.Success;
	}

	private async handleRole(member: GuildMember, roleId: Nullish | string): Promise<PartResult> {
		if (isNullish(roleId)) return PartResult.NotSet;

		const role = member.guild.roles.cache.get(roleId);

		// If the role doesn't exist anymore, reset:
		if (!role) {
			await container.prisma.guild.update({
				data: { rolesBirthday: null },
				where: { id: member.guild.id }
			});
			return PartResult.Invalid;
		}

		// If the role can be given, add it to the user:
		if ((await member.guild.members.fetchMe()).roles.highest.position > role.position) {
			await this.addBirthdayRole(member, role.id);
		}

		return PartResult.Success;
	}

	private isCorrectlyConfigured(birthdayRole: Nullish | string, birthdayChannel: Nullish | string) {
		// A birthday role, or a channel and message must be configured:
		return !isNullish(birthdayRole) || !isNullish(birthdayChannel);
	}

	private transformMessage(message: string, user: User, age: null | number, t: TFunction) {
		return message.replace(this.kTransformMessageRegExp, (match) => {
			switch (match) {
				case Matches.Age:
					return age === null ? t('globals:unknown') : age.toString();
				case Matches.AgeOrdinal:
					return age === null ? t('globals:unknown') : t('globals:ordinalValue', { value: age });
				case Matches.User:
					return user.toString();
				case Matches.UserName:
					return user.username;
				case Matches.UserTag:
					return user.tag;
				default:
					return match;
			}
		});
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		BirthdayReminderTask: TaskBirthdayData | undefined;
	}
}
