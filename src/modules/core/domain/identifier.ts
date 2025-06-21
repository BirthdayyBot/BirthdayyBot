import { ValueObject } from './value_object.js';

export class Identifier<T extends string> extends ValueObject<{ value: string }> {
	// @ts-expect-error - This is a hack to make the type work
	readonly #_type: T;

	public override toString() {
		return this.props.value;
	}

	public static fromString<T extends Identifier<any>>(this: new (props: { value: string }) => T, value: string): T {
		return new this({ value });
	}
}
