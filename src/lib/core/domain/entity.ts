export abstract class Entity<TProperties> {
	public readonly props: TProperties;

	protected constructor(props: TProperties) {
		this.props = props;
	}
}
