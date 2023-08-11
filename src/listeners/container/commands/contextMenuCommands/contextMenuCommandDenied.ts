import { reply } from '#lib/utils/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { type ContextMenuCommandDeniedPayload, Events, Listener, UserError } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({ event: Events.ContextMenuCommandDenied })
export class UserEvent extends Listener<typeof Events.ContextMenuCommandDenied> {
	public run({ context, message: content }: UserError, { interaction }: ContextMenuCommandDeniedPayload) {
		// `context: { silent: true }` should make UserError silent:
		// Use cases for this are for example permissions error when running the `eval` command.
		if (Reflect.get(Object(context), 'silent')) return;

		return reply(interaction, {
			content,
			allowedMentions: { users: [interaction.user.id], roles: [] },
			ephemeral: true,
		});
	}
}
