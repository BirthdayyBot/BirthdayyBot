import { ApplyOptions } from '@sapphire/decorators';
import { ContextMenuCommandDeniedPayload, Events, Listener, UserError } from '@sapphire/framework';
import reply from '../../../../helpers/send/response';

@ApplyOptions<Listener.Options>({ event: Events.ContextMenuCommandDenied })
export class UserEvent extends Listener<typeof Events.ContextMenuCommandDenied> {
	public async run({ context, message: content }: UserError, { interaction }: ContextMenuCommandDeniedPayload) {
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
