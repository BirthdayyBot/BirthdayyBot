import type { Identifier } from './identifier.js';

interface Properties<Name extends string = string> {
	id: Identifier<Name>;
}

export abstract class Entity<Name extends string = string, TProperties extends Properties<Name> = Properties<Name>> {
	public readonly props: TProperties;

	protected constructor(props: TProperties) {
		this.props = { ...props };
	}

	public get id(): string {
		return this.props.id.toString();
	}

	public get identifier(): TProperties['id'] {
		return this.props.id;
	}

	public equals(object?: Entity<Name, TProperties>): boolean {
		if (!object) return false;
		if (this === object) return true;
		return this.identifier.equals(object.identifier);
	}
}
