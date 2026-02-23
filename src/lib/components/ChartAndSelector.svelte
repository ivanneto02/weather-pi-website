<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';
	import TimeWindowSelector from './TimeWindowSelector.svelte';

	import { Chart, Svg, Axis, Spline, Highlight, Tooltip } from 'layerchart';
	import { format } from 'date-fns';
	import { curveBumpX } from 'd3-shape';

	type SeriesRow = Record<string, number>;
	type SeriesData = SeriesRow[];
	type SharedCacheEntry = { data: SeriesData; cachedAt: number };

	// Shared across all ChartAndSelector instances to avoid duplicate fetch+parse work.
	const sharedCache = new Map<string, SharedCacheEntry>();
	const inFlightRequests = new Map<string, Promise<SeriesData>>();

	let {
		dataSeries = [],
		xScale,
		yScale,
		measurement = 'none',
		title = '',
		initialWindow = '1h',
		bottom_axis_label = '',
		left_axis_label = '',
		spline_stroke_color = 'white',
		tooltip_label_name = 'none',
		tooltip_label_units = 'hPa',
		tooltip_label_round = 1,
		samples = 600,
		endpoint = '/api/samples/latest'
	} = $props();

	const dispatch = createEventDispatcher<{ select: string; ready: void }>();

	// Cache TTLs matching cron frequencies (in ms)
	const CACHE_TTL: Record<string, number> = {
		'1h': 5 * 60_000,
		'10h': 10 * 60_000,
		'1d': 30 * 60_000,
		'10d': 2 * 3_600_000,
		'3m': 6 * 3_600_000,
		'12m': 12 * 3_600_000
	};

	let selectedWindow = $state(initialWindow);
	let fetchedData = $state<typeof dataSeries | null>(null);
	let chartData = $derived(fetchedData ?? dataSeries);
	let hasEmittedReady = $state(false);
	let isLoading = $state((dataSeries?.length ?? 0) === 0);
	let chartRenderKey = $state(0);
	let completedRenderCount = $state(0);
	const measurementKey = $derived(
		measurement === 'temperature' || measurement === 'humidity' || measurement === 'pressure'
			? measurement
			: ''
	);

	$effect(() => {
		if (!hasEmittedReady && chartData.length > 0) {
			hasEmittedReady = true;
			dispatch('ready');
		}
	});

	async function fetchWindow(windowValue: string) {
		const cacheKey = `${endpoint}|${windowValue}|${samples}|${measurementKey || 'all'}`;
		const ttl = CACHE_TTL[windowValue] ?? 0;
		const cached = sharedCache.get(cacheKey);
		isLoading = true;
		fetchedData = [];

		if (cached && ttl > 0 && Date.now() - cached.cachedAt < ttl) {
			fetchedData = cached.data;
			isLoading = false;
			return;
		}

		const existingRequest = inFlightRequests.get(cacheKey);
		if (existingRequest) {
			fetchedData = await existingRequest;
			isLoading = false;
			return;
		}

		const params = new URLSearchParams({
			window: windowValue,
			samples: String(samples)
		});
		if (measurementKey) {
			params.set('measurement', measurementKey);
		}
		const url = `${endpoint}?${params.toString()}`;

		const requestPromise = (async () => {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Request failed with status ${response.status}`);
			}
			const payload = await response.json();
			const raw = Array.isArray(payload) ? payload : payload?.data ?? stubData(windowValue);
			// DynamoDB returns string values — coerce to numbers for the chart
			const normalized = raw.map((row: Record<string, unknown>, i: number) => {
				const coerced: Record<string, number> = { index: i };
				for (const [key, val] of Object.entries(row)) {
					if (key === 'pk') continue;
					coerced[key] = Number(val);
				}
				return coerced;
			});

			if (ttl > 0) {
				sharedCache.set(cacheKey, { data: normalized, cachedAt: Date.now() });
			}
			return normalized;
		})();

		inFlightRequests.set(cacheKey, requestPromise);

		try {
			fetchedData = await requestPromise;
		} catch (error) {
			fetchedData = stubData(windowValue);
		} finally {
			inFlightRequests.delete(cacheKey);
			chartRenderKey += 1;
			completedRenderCount += 1;
			isLoading = false;
		}
	}

	function handleSelect(event: CustomEvent<string>) {
		selectedWindow = event.detail;
		dispatch('select', selectedWindow);
		fetchWindow(selectedWindow);
	}

	onMount(() => {
		void fetchWindow(selectedWindow);
	});

	const formatValue = (value: number) => value?.toFixed(tooltip_label_round);

	function stubData(windowValue: string) {
		const now = Date.now();
		const stepMs = 60_000;
		return Array.from({ length: samples }, (_, idx) => {
			const ts = now - (samples - idx) * stepMs;
			const base = 20 + Math.sin(idx / 3) * 5;
			return {
				timestamp: ts,
				temperature: base,
				humidity: 40 + base / 2,
				pressure: 1000 + base / 10,
				count_03: base,
				count_05: base * 0.8,
				count_10: base * 0.6,
				count_25: base * 0.4,
				count_50: base * 0.2,
				count_100: base * 0.1
			};
		});
	}
</script>

<div class="flex flex-col gap-2 pb-6">
	{#if title}
		<h2 class="text-center">{title}</h2>
	{/if}

	<slot {selectedWindow} />

	<div class="h-[250px] p-4 rounded bg-black border border-white/5" data-window={selectedWindow}>
		{#if isLoading}
			<div class="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-300">
				<span class="h-7 w-7 animate-spin rounded-full border-2 border-slate-500 border-t-emerald-400"></span>
				<span class="text-sm">Loading graph...</span>
			</div>
		{:else}
			{#key chartRenderKey}
				<Chart
					data={chartData}
					x={(d) => new Date(d.timestamp)}
					y={(d) => Number(d?.[measurement] ?? 0)}
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
							label={left_axis_label}
						/>
						<Axis
							labelProps={{ class: 'text-sm text-blue' }}
							placement="bottom"
							rule
							class="text-white stroke-blue-200"
							label={bottom_axis_label}
						/>
						<Spline
							class={`${spline_stroke_color} stroke-2`}
							curve={curveBumpX}
							draw={completedRenderCount > 1 ? { duration: 1100 } : false}
						/>
						<Highlight lines />
					</Svg>

					<!-- Differs from the docs, using a snippet instead to pass in 
        children and avoid invalid_default_snippet runtime error -->
					<Tooltip.Root>
						{#snippet children(ctx)}
							<Tooltip.Header
								>{format(new Date(ctx?.data.timestamp), 'eee, MMM do, hh:mm:ss')}</Tooltip.Header
							>
							<Tooltip.List>
								<Tooltip.Item
									label={tooltip_label_name}
									value={`${formatValue(ctx?.data?.[measurement])} ${tooltip_label_units}`}
								/>
							</Tooltip.List>
						{/snippet}
					</Tooltip.Root>
				</Chart>
			{/key}
		{/if}
	</div>

	<TimeWindowSelector selectedValue={selectedWindow} on:select={handleSelect} />
</div>
