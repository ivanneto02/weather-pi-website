<script lang="ts">
	import TimeWindowSelector from './TimeWindowSelector.svelte';
	import { Svg, Axis, Spline, Chart, Highlight, Labels, Tooltip } from 'layerchart';
	import { scaleLinear, scaleTime } from 'd3-scale';
	import { curveBumpX } from 'd3-shape';
	import { formatDate, PeriodType } from '@layerstack/utils';
	import { format } from 'date-fns';

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
				timestamp: +row.timestamp,
				temperature: +row.temperature,
				humidity: +row.humidity,
				pressure: +row.pressure
			}))
		: [];

	const xScale = scaleTime();
	const yScale = scaleLinear();
</script>

<h2 class="text-center">Temperature</h2>

<div class="h-[250px] p-4 rounded bg-black">
	<Chart
		data={dataSeries}
		x={(d) => new Date(d.timestamp)}
		y={(d) => d.temperature.toFixed(2)}
		{xScale}
		{yScale}
		padding={{ left: 60, bottom: 34, top: 16, right: 16 }}
		yNice
		tooltip={{ mode: 'voronoi' }}
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
				label="time"
			/>
			<Spline class="stroke-primary stroke-2" curve={curveBumpX} draw />
			<Highlight points lines />
		</Svg>

		<!-- Differs from the docs, using a snippet instead to pass in 
        children and avoid invalid_default_snippet runtime error -->
		<Tooltip.Root>
			{#snippet children(ctx)}
				<Tooltip.Header
					>{format(new Date(ctx?.data.timestamp), 'eee, MMM do, hh:mm:ss')}</Tooltip.Header
				>
				<Tooltip.List>
					<Tooltip.Item label="temperature" value={`${ctx?.data.temperature.toFixed(2)} C`} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	</Chart>
</div>

<TimeWindowSelector />

<h2 class="text-center">Humidity</h2>

<div class="h-[250px] p-4 rounded bg-black">
	<Chart
		data={dataSeries}
		x={(d) => new Date(d.timestamp)}
		y={(d) => d.humidity.toFixed(2)}
		{xScale}
		{yScale}
		padding={{ left: 60, bottom: 34, top: 16, right: 16 }}
		yNice
		tooltip={{ mode: 'voronoi' }}
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
				format={(d) => formatDate(d, PeriodType.TimeOnly, { variant: 'short' })}
				label="time"
			/>
			<Spline class="stroke-secondary stroke-2" curve={curveBumpX} draw />
			<Highlight points lines />
		</Svg>

		<!-- Differs from the docs, using a snippet instead to pass in 
        children and avoid invalid_default_snippet runtime error -->
		<Tooltip.Root>
			{#snippet children(ctx)}
				<Tooltip.Header
					>{format(new Date(ctx?.data.timestamp), 'eee, MMM do, hh:mm:ss')}</Tooltip.Header
				>
				<Tooltip.List>
					<Tooltip.Item label="humidity" value={`${ctx?.data.humidity.toFixed(2)}%`} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	</Chart>
</div>

<TimeWindowSelector />

<h2 class="text-center">Pressure</h2>

<div class="h-[250px] p-4 rounded bg-black">
	<Chart
		data={dataSeries}
		x={(d) => new Date(d.timestamp)}
		y={(d) => d.pressure.toFixed(3)}
		{xScale}
		{yScale}
		padding={{ left: 70, bottom: 34, top: 16, right: 16 }}
		yNice
		tooltip={{ mode: 'voronoi' }}
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
				format={(d) => formatDate(d, PeriodType.TimeOnly, { variant: 'short' })}
				label="time"
			/>
			<Spline class="stroke-green-800 stroke-2" curve={curveBumpX} draw />
			<Highlight points lines />
		</Svg>

		<!-- Differs from the docs, using a snippet instead to pass in 
        children and avoid invalid_default_snippet runtime error -->
		<Tooltip.Root>
			{#snippet children(ctx)}
				<Tooltip.Header
					>{format(new Date(ctx?.data.timestamp), 'eee, MMM do, hh:mm:ss')}</Tooltip.Header
				>
				<Tooltip.List>
					<Tooltip.Item label="pressure" value={`${ctx?.data.pressure.toFixed(3)} hPa`} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	</Chart>
</div>

<TimeWindowSelector />
