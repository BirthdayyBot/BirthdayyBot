import { Entity } from '#root/modules/core/domain/entity.js';
import type { GuildConfigIdentifier } from '#root/modules/guild_config/domain/guild_config_identifier.js';

interface Properties {
	id: GuildConfigIdentifier;
	createdAt: Date;
	updatedAt: Date;
	disabled: boolean;
	premium: boolean;
	locale: string;
	timezone: string;
	announcementChannel: string | null;
	announcementMessage: string | null;
	overviewChannel: string | null;
	overviewMessage: string | null;
	birthdayRole: string | null;
	birthdayPingRole: string | null;
	logChannel: string | null;
	inviter: string | null;
}

export class GuildConfig extends Entity<Properties> {
	public get isAnnouncementConfigured() {
		return Boolean(this.props.announcementChannel && this.props.announcementMessage);
	}

	public get isOverviewConfigured() {
		return Boolean(this.props.overviewChannel && this.props.overviewMessage);
	}

	public get isBirthdayRoleConfigured() {
		return Boolean(this.props.birthdayRole);
	}

	public get isBirthdayPingRoleConfigured() {
		return Boolean(this.props.birthdayPingRole);
	}

	public get isLogChannelConfigured() {
		return Boolean(this.props.logChannel);
	}

	public static create(properties: Properties) {
		return new this(properties);
	}
}
