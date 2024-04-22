import { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';
// Root
export const RootName = T('commands/config:name');
export const RootDescription = T('commands/config:description');
export const RootExtended = T<LanguageHelpDisplayOptions>('commands/config:extended');

export const View = 'commands/config:view';
export const ViewContent = FT<{
	announcementChannel: string;
	announcementMessage: string;
	birthdayRole: string;
	birthdayPingRole: string;
	overviewChannel: string;
	timezone: string;
}>('commands/config:viewContent');

export const Edit = 'commands/config:edit';
export const EditOptionsAnnouncementChannelDescription = T('commands/config:editOptionsAnnouncementChannelDescription');
export const EditOptionsAnnouncementMessageDescription = T('commands/config:editOptionsAnnouncementMessageDescription');
export const EditOptionsBirthdayRoleDescription = T('commands/config:editOptionsBirthdayRoleDescription');
export const EditOptionsBirthdayPingRoleDescription = T('commands/config:editOptionsBirthdayPingRoleDescription');
export const EditOptionsOverviewChannelDescription = T('commands/config:editOptionsOverviewChannelDescription');
export const EditOptionsTimezoneDescription = T('commands/config:editOptionsTimezoneDescription');
export const EditChannelCanSendEmbeds = T('commands/config:editChannelCanSendEmbeds');
export const EditMessagePremiumRequired = T('commands/config:editMessagePremiumRequired');
export const EditMessageTooLong = T('commands/config:editMessageTooLong');
export const editRoleHigher = T('commands/config:editRoleHigher');
export const editRoleNotManageable = T('commands/config:editRoleNotManageable');

export const Reset = 'commands/config:reset';
export const ResetOptionsKey = 'commands/config:resetOptionsKey';
export const ResetOptionsKeyChoicesAll = T('commands/config:resetOptionsKeyChoicesAll');

export const KeyAnnouncementChannel = T('commands/config:keyAnnouncementChannel');
export const KeyAnnouncementMessage = T('commands/config:keyAnnouncementMessage');
export const KeyBirthdayRole = T('commands/config:keyBirthdayRole');
export const KeyBirthdayPingRole = T('commands/config:keyBirthdayPingRole');
export const KeyOverviewChannel = T('commands/config:keyOverviewChannel');
export const KeyTimezone = T('commands/config:keyTimezone');

export const EditSuccess = T('commands/config:editSuccess');
export const EditFailure = T('commands/config:editFailure');
