import { reply } from '#utils/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, UserError, type ChatInputCommandDeniedPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({ event: Events.ChatInputCommandDenied })
export class UserEvent extends Listener<typeof Events.ChatInputCommandDenied> {
	public run({ context, message: content }: UserError, { interaction }: ChatInputCommandDeniedPayload) {
		// `context: { silent: true }` should make UserError silent:
		// Use cases for this are for example permissions error when running the `eval` command.
		if (Reflect.get(Object(context), 'silent')) return;

		return reply({
			content,
			allowedMentions: { users: [interaction.user.id], roles: [] },
			ephemeral: true,
		});
	}
}
