// catch to null
export async function catchToNull<T>(promise: Promise<T>) {
	return promise.catch(() => null);
}
