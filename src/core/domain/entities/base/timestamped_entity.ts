/**
 * Represents an entity with required timestamp fields for creation and last update.
 */
export interface TimestampedEntity {
	/** The date and time when the entity was created. */
	createdAt: Date;
	/** The date and time when the entity was last updated. */
	updatedAt: Date;
}

/**
 * Represents an entity with optional timestamp fields.
 * Useful for entities being created where timestamps may be set by the database.
 */
export interface OptionalTimestampedEntity {
	/** The date and time when the entity was created, if available. */
	createdAt?: Date;
	/** The date and time when the entity was last updated, if available. */
	updatedAt?: Date;
}
