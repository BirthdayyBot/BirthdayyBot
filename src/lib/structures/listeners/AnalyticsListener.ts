import type { Point } from '@influxdata/influxdb-client';

import { Tags } from '#lib/types/AnalyticsSchema';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { envParseBoolean } from '@skyra/env-utilities';

export abstract class AnalyticsListener extends Listener {
	public tags: [Tags, string][] = [];

	public constructor(context: Listener.LoaderContext, options?: AnalyticsListener.Options) {
		super(context, { ...options, enabled: envParseBoolean('INFLUX_ENABLED') });
	}

	public override onLoad() {
		this.initTags();
		return super.onLoad();
	}

	public writePoint(point: Point) {
		return this.container.client.analytics!.writeApi?.writePoint(this.injectTags(point));
	}

	public writePoints(points: Point[]) {
		points = points.map((point) => this.injectTags(point));
		return this.container.client.analytics!.writeApi?.writePoints(points);
	}

	protected initTags() {
		this.tags.push([Tags.Client, process.env.CLIENT_ID], [Tags.OriginEvent, String(this.event)]);
	}

	protected injectTags(point: Point) {
		for (const tag of this.tags) {
			point.tag(tag[0], tag[1]);
		}
		return point;
	}
}

export namespace AnalyticsListener {
	export type Options = Omit<ListenerOptions, 'enabled'>;
}
