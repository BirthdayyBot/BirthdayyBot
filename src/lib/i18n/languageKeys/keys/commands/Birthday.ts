import { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { T } from '#lib/types';

export const Name = T<string>('commands/birthday:name');
export const Description = T<string>('commands/birthday:description');
export const Extended = T<LanguageHelpDisplayOptions>('commands/birthday:extended');

export const List = T<string>('commands/birthday:list');

export const ListTitleMonth = T<string>('commands/birthday:list.title.month');
export const ListTitleNext = T<string>('commands/birthday:list.title.next');

export const Set = T<string>('commands/birthday:set');
export const SetSuccess = T<string>('commands/birthday:set.success');

export const Remove = T<string>('commands/birthday:remove');

export const Show = T<string>('commands/birthday:show');
export const ShowTitle = T<string>('commands/birthday:show.title');
export const ShowNotSet = T<string>('commands/birthday:show.notSet');

export const Test = T<string>('commands/birthday:test');
export const TestNotSet = T<string>('commands/birthday:test.notSet');
