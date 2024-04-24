import { type DurationFormatAssetsTime, DurationFormatter } from '@sapphire/duration';

export abstract class Handler {
	public readonly duration: DurationFormatter;
	public readonly name: string;

	public constructor(options: Handler.Options) {
		this.name = options.name;
		this.duration = new DurationFormatter(options.duration);
	}
}

export namespace Handler {
	export interface Options {
		duration: DurationFormatAssetsTime;
		name: string;
	}
}
