import { container } from '@sapphire/framework';
import { Utility } from '@sapphire/plugin-utilities-store';

export class User extends Utility {
	public get = {
		UserById: (id: string) => this.prisma.user.findUnique({ where: { id } }),
		UserCount: () => this.prisma.user.count(),
	};

	private prisma = container.prisma;

	public constructor(context: Utility.Context, options: Utility.Options) {
		super(context, {
			...options,
			name: 'user',
		});
	}
}
