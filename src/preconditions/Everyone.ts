import { Precondition } from '@sapphire/framework';

export class UserPermissionsPrecondition extends Precondition {
	public override async chatInputRun() {
		return this.ok();
	}

	public override async contextMenuRun() {
		return this.ok();
	}
}
