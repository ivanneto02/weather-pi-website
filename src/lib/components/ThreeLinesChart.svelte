<script lang="ts">
	import { Svg, Axis, Spline, Chart, Highlight, Labels, Tooltip } from 'layerchart';
	import { scaleLinear } from 'd3-scale';
	import { curveBumpX } from 'd3-shape';

	type Row = {
		temperature: number;
		timestamp: string;
		pk: string;
		humidity: number;
		pressure: number;
	};

	export let data: Row[] = [];

	$: dataSeries = data
		? data.map((row, i) => ({
				index: i,
				value: +row.temperature
			}))
		: [];

	const xScale = scaleLinear();
	const yScale = scaleLinear();
</script>

<div class="h-[500px] p-4 rounded bg-black">
	<Chart
		data={dataSeries}
		x="index"
		y={(d) => d.value.toFixed(2)}
		xDomain={[0, dataSeries.length - 1]}
		{xScale}
		{yScale}
		padding={{ left: 60, bottom: 34, top: 16, right: 16 }}
		yNice
		tooltip={{ mode: 'bisect-x' }}
	>
		<Svg>
			<Axis
				placement="left"
				tickLabelProps={{ class: 'text-sm text-blue' }}
				grid
				rule
				label="temperature"
			/>
			<Axis
				labelProps={{ class: 'text-sm text-blue' }}
				placement="bottom"
				rule
				class="text-white stroke-blue-200"
				label="sample (30 seconds)"
			/>
			<Spline class="stroke-primary stroke-2" curve={curveBumpX} draw />
			<Highlight points lines />
			<Labels format="decimal" />
		</Svg>
	</Chart>
</div>
