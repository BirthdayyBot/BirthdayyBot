import { Utility } from '@sapphire/plugin-utilities-store';

export class User extends Utility {
	public get = {
		UserById: (userId: string) => this.prisma.user.findUnique({ where: { userId } }),
		UserCount: () => this.prisma.user.count(),
	};

	private prisma = this.container.prisma;

	public constructor(context: Utility.Context, options: Utility.Options) {
		super(context, {
			...options,
			name: 'user',
		});
	}
}
