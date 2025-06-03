/**
 * Interface representing an entity with timestamp fields for tracking creation and update times
 */
export interface TimestampedEntity {
	/** Timestamp when the entity was first created */
	createdAt: Date;
	/** Timestamp when the entity was last updated */
	updatedAt: Date;
}

/**
 * Interface for entities with optional timestamp fields
 * Useful for creating new entities where timestamps will be set by the database
 */
export interface OptionalTimestampedEntity {
	createdAt?: Date;
	updatedAt?: Date;
}
