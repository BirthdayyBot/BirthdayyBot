import type { WithBirthdays } from '../birthday/with_birthdays.js';
import type { TimestampedEntity } from './timestamped_entity.js';

/**
 * Represents a base entity with an identifier and timestamps.
 * @template T - The type of the entity's identifier.
 */
export interface Entity<Id extends string | object = string> extends TimestampedEntity, WithBirthdays {
	id: Id;
}
