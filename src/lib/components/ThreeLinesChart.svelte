<script lang="ts">
	import { Svg, Axis, Spline, Chart, Highlight, Labels, Tooltip } from 'layerchart';
	import { scaleLinear } from 'd3-scale';
	import { curveBumpX } from 'd3-shape';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any

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
				temperature: +row.temperature,
				humidity: +row.humidity,
				pressure: +row.pressure
			}))
		: [];

	const xScale = scaleLinear();
	const yScale = scaleLinear();
</script>

<div class="h-[500px] p-4 rounded bg-black">
	<Chart
		data={dataSeries}
		x="index"
		y={(d) => d.temperature.toFixed(2)}
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
				label="temperature (Celcius)"
			/>
			<Axis
				labelProps={{ class: 'text-sm text-blue' }}
				placement="bottom"
				rule
				class="text-white stroke-blue-200"
				label="least to most recent, 30-second intervals"
			/>
			<Spline class="stroke-primary stroke-2" curve={curveBumpX} draw />
			<Highlight points lines />
		</Svg>

		<!-- Differs from the docs, using a snippet instead to pass in 
        children and avoid invalid_default_snippet runtime error -->
		<Tooltip.Root>
			{#snippet children(ctx)}
				<Tooltip.Header>Sample {ctx?.data.index}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="value" value={`${ctx?.data.temperature.toFixed(2)} C`} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	</Chart>
</div>

<div class="h-[500px] p-4 rounded bg-black">
	<Chart
		data={dataSeries}
		x="index"
		y={(d) => d.humidity.toFixed(2)}
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
				label="Relative Humidity (%)"
			/>
			<Axis
				labelProps={{ class: 'text-sm text-blue' }}
				placement="bottom"
				rule
				class="text-white stroke-blue-200"
				label="least to most recent, 30-second intervals"
			/>
			<Spline class="stroke-secondary stroke-2" curve={curveBumpX} draw />
			<Highlight points lines />
		</Svg>

		<!-- Differs from the docs, using a snippet instead to pass in 
        children and avoid invalid_default_snippet runtime error -->
		<Tooltip.Root>
			{#snippet children(ctx)}
				<Tooltip.Header>Sample {ctx?.data.index}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="value" value={`${ctx?.data.humidity.toFixed(2)}%`} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	</Chart>
</div>

<div class="h-[500px] p-4 rounded bg-black">
	<Chart
		data={dataSeries}
		x="index"
		y={(d) => d.pressure.toFixed(3)}
		xDomain={[0, dataSeries.length - 1]}
		{xScale}
		{yScale}
		padding={{ left: 70, bottom: 34, top: 16, right: 16 }}
		yNice
		tooltip={{ mode: 'bisect-x' }}
	>
		<Svg>
			<Axis
				placement="left"
				tickLabelProps={{ class: 'text-sm text-blue' }}
				grid
				rule
				label="pressure (hectopascal)"
			/>
			<Axis
				labelProps={{ class: 'text-sm text-blue' }}
				placement="bottom"
				rule
				class="text-white stroke-blue-200"
				label="least to most recent, 30-second intervals"
			/>
			<Spline class="stroke-green-800 stroke-2" curve={curveBumpX} draw />
			<Highlight points lines />
		</Svg>

		<!-- Differs from the docs, using a snippet instead to pass in 
        children and avoid invalid_default_snippet runtime error -->
		<Tooltip.Root>
			{#snippet children(ctx)}
				<Tooltip.Header>Sample {ctx?.data.index}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="value" value={`${ctx?.data.pressure.toFixed(3)} hPa`} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	</Chart>
</div>
