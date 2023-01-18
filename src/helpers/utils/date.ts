export function getCurrentDate(): string {
	const d1 = new Date().toLocaleString('en-US', {
		timeZone: 'Europe/Berlin'
	});
	const date = new Date(d1);

	const d = date.getDate();
	const day = d <= 9 ? '0' + d : d;

	const m = date.getMonth();
	const month = m <= 9 ? '0' + m : m;

	const year = date.getFullYear();

	const str = `${year}-${month}-${day}`;
	console.log('today: ', str);
	return str;
}
