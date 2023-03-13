import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';

interface RoleRemovePayload {
    guild_id: string;
    role_id: string;
    user_id: string;
    isTest: boolean;
}

@ApplyOptions<ScheduledTask.Options>({ name: 'RoleRemove', bullJobsOptions: { removeOnComplete: true } })
export class RoleRemoveTask extends ScheduledTask {
    public async run(payload: RoleRemovePayload) {
        const { guild_id, role_id, user_id, isTest } = payload;

        const guild = await this.container.client.guilds.fetch(guild_id);
        const member = await guild.members.fetch(user_id);
        const role = await guild.roles.fetch(role_id);

        if (!role) return this.container.logger.error(`[Task] RoleRemoveTask: Role not found: ${role_id}`);

        if (isTest) {
            this.container.logger.info(`[Task] RoleRemoveTask: ${guild_id} ${role_id} ${user_id}`);
            return;
        }

        await member.roles.remove(role);

        this.container.logger.info(`[Task] RoleRemoveTask: Removed role ${role.name} from user ${member.user.id}`);
    }
}
