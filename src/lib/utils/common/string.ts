import { container } from '@sapphire/pieces';

export function addZeroToSingleDigitNumber(number: number | string): string {
	return number.toString().length < 2 ? `0${number}` : `${number}`;
}

export function checkIfLengthIsTwo(number: string) {
	return number.length < 2 ? `0${number}` : number;
}

export function logLimiter() {
	container.logger.info('===============================');
}

export function checkLength(length: number, string: string) {
	return string.toString().length === length;
}
