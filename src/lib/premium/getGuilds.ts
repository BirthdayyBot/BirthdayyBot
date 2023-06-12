import { container } from '@sapphire/framework';

export default function getPremiumGuilds() {
	return container.prisma.guild.findMany({
		where: {
			premium: true,
		},
		select: {
			guildId: true,
			premium: true,
		},
	});
}
