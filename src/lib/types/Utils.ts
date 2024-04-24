/* eslint-disable @typescript-eslint/ban-types */
export type TypedT<TCustom = string> = { __type__: TCustom } & string;
export type GetTypedT<T extends TypedT<unknown>> = T extends TypedT<infer U> ? U : never;

export function T<TCustom = string>(k: string): TypedT<TCustom> {
	return k as TypedT<TCustom>;
}

export type TypedFT<TArgs, TReturn = string> = { __args__: TArgs; __return__: TReturn } & string;
export type GetTypedFTArgs<T extends TypedFT<unknown, unknown>> = T extends TypedFT<infer U, unknown> ? U : never;
export type GetTypedFTReturn<T extends TypedFT<unknown, unknown>> = T extends TypedFT<unknown, infer U> ? U : never;

export function FT<TArgs, TReturn = string>(k: string): TypedFT<TArgs, TReturn> {
	return k as TypedFT<TArgs, TReturn>;
}

export interface Value<T = string> {
	value: T;
}

export interface Values<T = string> {
	count: number;
	values: readonly T[];
}

export interface Difference<T = string> {
	next: T;
	previous: T;
}

export interface Parameter {
	parameter: string;
}
