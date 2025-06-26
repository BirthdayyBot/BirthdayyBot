import { Identifier } from '../../core/domain/identifier.js';

export const USER_IDENTIFIER_TYPE = 'UserIdentifier';

export class UserIdentifier extends Identifier<typeof USER_IDENTIFIER_TYPE> {}
