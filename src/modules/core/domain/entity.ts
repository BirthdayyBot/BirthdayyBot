import type { Identifier } from './identifier.js';

export abstract class Entity<TProperties extends { id: Identifier<any> }> {
	public readonly props: TProperties;

	protected constructor(props: TProperties) {
		this.props = props;
	}

	public getIdentifier() {
		return this.props.id;
	}

	public equals(object: Entity<TProperties>) {
		if (this === object) {
			return true;
		}

		return this.getIdentifier().equals(object.getIdentifier()) || false;
	}
}
