import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  Cloud,
  CloudRain,
  Compass,
  Droplets,
  ExternalLink,
  Gauge,
  RefreshCw,
  Sun,
  Sunrise,
  Sunset,
  ThermometerSun,
  Waves,
  Wind,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import {
  degreesToCompass,
  describeAqi,
  describeUvRisk,
  describeWmoCode,
  useDetailedWeather,
  type HourlyPoint,
} from '../hooks/useDetailedWeather';

function formatDayLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00+08:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatHourLabel(iso: string): string {
  const parts = iso.split('T');
  if (parts.length < 2) return iso;
  const [hStr] = parts[1].split(':');
  const h = Number(hStr);
  if (!Number.isFinite(h)) return parts[1];
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${suffix}`;
}

function formatTimeOnly(iso: string): string {
  if (!iso || !iso.includes('T')) return '—';
  const parts = iso.split('T')[1]?.split(':');
  if (!parts || parts.length < 2) return '—';
  const h = Number(parts[0]);
  const m = parts[1];
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${suffix}`;
}

const OFFICIAL_WEATHER_LINKS = [
  {
    title: 'PAGASA Agno River Flood Bulletins',
    agency: 'ARBFFWC Rosales',
    url: 'https://www.pagasa.dost.gov.ph/flood',
  },
  {
    title: 'PAGASA Daily Heat Index',
    agency: 'DOST-PAGASA',
    url: 'https://www.pagasa.dost.gov.ph/climate/climate-heat-index',
  },
  {
    title: 'NAPOCOR Dam Status (San Roque)',
    agency: 'NAPOCOR',
    url: 'https://www.napocor.gov.ph/',
  },
  {
    title: 'UP NOAH Flood Hazard Maps',
    agency: 'UP Resilience Institute',
    url: 'https://noah.up.edu.ph/',
  },
  {
    title: 'GeoRiskPH HazardHunterPH',
    agency: 'DOST / PHIVOLCS / MGB',
    url: 'https://hazardhunter.georisk.gov.ph/',
  },
];

function HourlyMobileRow({ hr }: { hr: HourlyPoint }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left text-sm hover:bg-slate-50/70"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-mono text-xs font-semibold text-[#0f2342]">
            {formatDayLabel(hr.time.slice(0, 10)).split(',')[0]} {formatHourLabel(hr.time)}
          </span>
          <span className="truncate text-sm text-slate-700">{describeWmoCode(hr.weatherCode)}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2.5 font-mono text-sm tabular-nums">
          <span>
            <strong className="text-[#0f2342]">{hr.tempC.toFixed(0)}°</strong>
            <span className="text-slate-400">/{hr.apparentC.toFixed(0)}°</span>
          </span>
          <span className="text-xs font-semibold text-[#1976a8]">{hr.precipProbPct}%</span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="grid grid-cols-2 gap-2.5 bg-[#faf7f2]/80 px-3.5 pb-3.5 pt-2 text-xs">
          <div>
            <span className="text-slate-500">Sky:</span>{' '}
            <strong className="text-[#0f2342]">{describeWmoCode(hr.weatherCode)}</strong>
          </div>
          <div>
            <span className="text-slate-500">Temp / Feels:</span>{' '}
            <strong className="font-mono text-[#0f2342]">
              {hr.tempC.toFixed(1)}°C / {hr.apparentC.toFixed(1)}°C
            </strong>
          </div>
          <div>
            <span className="text-slate-500">Rain:</span>{' '}
            <strong className="font-mono text-[#1976a8]">
              {hr.precipMm.toFixed(1)} mm ({hr.precipProbPct}%)
            </strong>
          </div>
          <div>
            <span className="text-slate-500">Humidity:</span>{' '}
            <strong className="font-mono text-[#0f2342]">{hr.humidityPct}%</strong>
          </div>
          <div>
            <span className="text-slate-500">Wind / Gust:</span>{' '}
            <strong className="font-mono text-[#0f2342]">
              {hr.windKmh.toFixed(0)} / {hr.gustKmh.toFixed(0)} km/h
            </strong>
          </div>
          <div>
            <span className="text-slate-500">UV Index:</span>{' '}
            <strong className="font-mono text-[#0f2342]">{hr.uvIndex.toFixed(1)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

function WeatherSplashScreen() {
  return (
    <div
      className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-[#0f2342]/10 bg-white px-6 py-12 text-center shadow-sm"
      aria-busy="true"
      aria-label="Loading Alcala weather data"
    >
      <div className="relative flex items-center justify-center">
        <span
          className="absolute h-24 w-24 rounded-full bg-[#26489a]/10 animate-ping"
          aria-hidden="true"
        />
        <span
          className="absolute h-20 w-20 rounded-full border-2 border-[#26489a]/25"
          aria-hidden="true"
        />
        <img
          src="/assets/images/logo/alcala-seal-v2.png"
          alt="Official Seal of Alcala, Pangasinan"
          width={72}
          height={72}
          className="relative h-18 w-18 rounded-full object-contain shadow-sm"
        />
      </div>

      <div className="mt-6 font-serif text-2xl font-bold tracking-tight">
        <span className="text-[#0032a0]">Better</span>
        <span className="text-[#f77f00]">Alcala</span>
      </div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
        Weather &amp; River Watch
      </div>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#edf2fa] px-4 py-1.5 text-xs font-semibold text-[#26489a]">
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        <span>Loading live weather, Heat Index &amp; Agno River telemetry…</span>
      </div>
    </div>
  );
}

export default function WeatherPage() {
  const { data, loading, error, lastFetched, refresh } = useDetailedWeather();
  const [hourlyWindow, setHourlyWindow] = useState<24 | 48>(24);

  const visibleHourly = useMemo(() => {
    if (!data) return [];
    return data.hourly.slice(0, hourlyWindow);
  }, [data, hourlyWindow]);

  const maxDischarge = useMemo(() => {
    if (!data?.riverDischarge.length) return 1;
    return Math.max(...data.riverDischarge.map((d) => d.max || d.discharge || 0), 0.5);
  }, [data]);

  const todayIso = new Date().toISOString().slice(0, 10);
  const todayDaily = data?.daily.find((d) => d.date === todayIso) ?? data?.daily[0];
  const nextSixDays = useMemo(() => {
    if (!data) return [];
    return data.daily.filter((d) => d.date !== todayIso).slice(0, 6);
  }, [data, todayIso]);

  const uvPeak = todayDaily?.uvMax ?? data?.airQuality.uvIndexNow ?? 0;
  const uvInfo = describeUvRisk(uvPeak);
  const todayDischarge =
    data?.riverDischarge.find((d) => d.date === todayIso)?.discharge ??
    data?.riverDischarge[0]?.discharge ??
    null;

  return (
    <Layout breadcrumbs={[{ label: 'Weather' }]}>
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="page-header-badge">
              <i className="bi bi-cloud-sun-fill" aria-hidden="true" />{' '}
              <span>Meteorology &amp; River Watch</span>
            </span>
            <h1>Alcala Weather &amp; River Watch</h1>
            <p className="page-header-desc">
              Live surface conditions, PAGASA Heat Index tiers, 48h hourly &amp; 6-day forecast, air quality, and Agno River discharge.
            </p>
          </div>
        </div>
      </section>

      <section className="section py-6 sm:py-8">
        <div className="container space-y-5 sm:space-y-6">
          {loading && !data ? (
            <WeatherSplashScreen />
          ) : (
            <>
          {/* Current Conditions & 8 Telemetry Cards */}
          <div className="rounded-2xl border border-[#0f2342]/10 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="inline-flex items-start sm:items-center gap-2 text-xs font-semibold text-[#2e8b57] sm:rounded-full sm:bg-[#eaf5ef] sm:px-3 sm:py-1">
                <span className="mt-1 sm:mt-0 h-2 w-2 shrink-0 rounded-full bg-[#2e8b57]" />
                <div className="leading-snug sm:flex sm:items-center sm:gap-1">
                  <span>Live · Alcala, Pangasinan</span>
                  <span className="block font-mono text-[11px] text-[#2e8b57]/90 sm:inline sm:font-sans sm:text-xs sm:text-[#2e8b57]">
                    (15.8472° N, 120.5214° E)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void refresh()}
                disabled={loading}
                className="btn btn-secondary btn-sm inline-flex shrink-0 items-center gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                {lastFetched ? `Updated ${lastFetched}` : 'Refresh'}
              </button>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Open-Meteo unavailable ({error}). Use official PAGASA links below.</span>
              </div>
            )}

            <div className="mt-4 grid gap-4 lg:grid-cols-3 sm:gap-5">
              {/* Primary Current Card */}
              <div className="flex flex-col justify-between rounded-xl border border-[#26489a]/15 bg-[#edf2fa]/60 p-4 sm:p-5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide text-[#26489a]">
                      Now in Alcala
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {data ? `Elev. ${data.elevationM} m` : ''}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-3">
                    <span className="font-mono text-4xl font-bold tabular-nums text-[#0f2342]">
                      {data ? `${data.current.tempC.toFixed(1)}°C` : '—'}
                    </span>
                    <span className="text-base font-semibold text-slate-700">
                      {data ? describeWmoCode(data.current.weatherCode) : 'Loading…'}
                    </span>
                  </div>
                  <div className="mt-1.5 text-sm text-slate-600">
                    {data ? `Feels like ${data.current.apparentC.toFixed(1)}°C` : 'Fetching telemetry…'}
                  </div>
                </div>
                {todayDaily && (
                  <div className="mt-4 flex items-center gap-4 border-t border-[#26489a]/15 pt-3 text-xs text-slate-700">
                    <span className="inline-flex items-center gap-1">
                      <Sunrise className="h-4 w-4 text-amber-600" />
                      {formatTimeOnly(todayDaily.sunrise)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Sunset className="h-4 w-4 text-[#d1432a]" />
                      {formatTimeOnly(todayDaily.sunset)}
                    </span>
                  </div>
                )}
              </div>

              {/* 2-per-row on mobile, 4-per-row on lg */}
              <div className="grid grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-4">
                <div className="rounded-xl border border-[#d1432a]/20 bg-[#fdf0ed]/60 p-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#d1432a]">
                    <span>Heat Index</span>
                    <ThermometerSun className="h-4 w-4" />
                  </div>
                  <div className="mt-1.5 font-mono text-xl font-bold tabular-nums text-[#0f2342]">
                    {data ? `${data.current.heatIndexC.toFixed(1)}°C` : '—'}
                  </div>
                  {data && (
                    <span className={`mt-1 inline-block rounded border px-1.5 py-0.5 text-xs font-semibold ${data.current.heatTier.badgeClass}`}>
                      {data.current.heatTier.label}
                    </span>
                  )}
                </div>

                <div className="rounded-xl border border-[#1976a8]/20 bg-[#e8f3f8]/60 p-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#1976a8]">
                    <span>24h Rain</span>
                    <CloudRain className="h-4 w-4" />
                  </div>
                  <div className="mt-1.5 font-mono text-xl font-bold tabular-nums text-[#0f2342]">
                    {data ? `${data.next24hRainMm.toFixed(1)} mm` : '—'}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    {data ? `Prob: ${data.next24hMaxProbPct}%` : '—'}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>Wind</span>
                    <Wind className="h-4 w-4 text-[#26489a]" />
                  </div>
                  <div className="mt-1.5 font-mono text-xl font-bold tabular-nums text-[#0f2342]">
                    {data ? `${data.current.windKmh.toFixed(0)} km/h` : '—'}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                    <Compass className="h-3.5 w-3.5 shrink-0" />
                    {data ? `${degreesToCompass(data.current.windDirDeg)} · Gust ${data.current.gustKmh.toFixed(0)}` : '—'}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>Humidity</span>
                    <Droplets className="h-4 w-4 text-[#1976a8]" />
                  </div>
                  <div className="mt-1.5 font-mono text-xl font-bold tabular-nums text-[#0f2342]">
                    {data ? `${data.current.humidityPct}%` : '—'}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    {data?.hourly[0] ? `Dew ${data.hourly[0].dewPointC.toFixed(1)}°C` : '—'}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>UV Peak</span>
                    <Sun className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="mt-1.5 font-mono text-xl font-bold tabular-nums text-[#0f2342]">
                    {data ? uvPeak.toFixed(1) : '—'}
                  </div>
                  <div className={`mt-1 text-xs font-semibold ${uvInfo.colorClass}`}>
                    {data ? uvInfo.label : '—'}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>Pressure</span>
                    <Gauge className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="mt-1.5 font-mono text-xl font-bold tabular-nums text-[#0f2342]">
                    {data ? `${data.current.pressureMslHpa.toFixed(0)} hPa` : '—'}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                    <Cloud className="h-3.5 w-3.5 shrink-0" />
                    {data ? `Cloud ${data.current.cloudCoverPct}%` : '—'}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>Air Quality</span>
                    <Wind className="h-4 w-4 text-[#2e8b57]" />
                  </div>
                  <div className="mt-1.5 font-mono text-xl font-bold tabular-nums text-[#0f2342]">
                    {data?.airQuality.usAqi ?? '—'}
                  </div>
                  <div className="mt-1 truncate text-xs text-slate-600">
                    {data ? describeAqi(data.airQuality.usAqi) : '—'}
                  </div>
                </div>

                <div className="rounded-xl border border-[#2e8b57]/20 bg-[#eaf5ef]/60 p-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#2e8b57]">
                    <span>Agno River</span>
                    <Waves className="h-4 w-4" />
                  </div>
                  <div className="mt-1.5 font-mono text-xl font-bold tabular-nums text-[#0f2342]">
                    {todayDischarge !== null ? `${todayDischarge.toFixed(2)} m³/s` : '—'}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">GloFAS grid</div>
                </div>
              </div>
            </div>

            {data && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-[#faf7f2] px-4 py-3 text-sm text-slate-700">
                <strong className="text-[#0f2342]">Heat Advisory ({data.current.heatTier.label}):</strong>{' '}
                {data.current.heatTier.advisory}
              </div>
            )}
          </div>

          {/* Hourly Forecast — Mobile row accordions (no horizontal swipe), Desktop full table */}
          {data && (
            <div className="rounded-2xl border border-[#0f2342]/10 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#0f2342] sm:text-2xl">
                    Hourly Weather &amp; Rain
                  </h2>
                  <p className="text-sm text-slate-600">
                    Next {hourlyWindow}h · Tap any hour on mobile for full metrics
                  </p>
                </div>
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setHourlyWindow(24)}
                    className={`rounded-md px-3 py-1.5 ${hourlyWindow === 24 ? 'bg-[#0f2342] text-white' : 'text-slate-600'}`}
                  >
                    24h
                  </button>
                  <button
                    type="button"
                    onClick={() => setHourlyWindow(48)}
                    className={`rounded-md px-3 py-1.5 ${hourlyWindow === 48 ? 'bg-[#0f2342] text-white' : 'text-slate-600'}`}
                  >
                    48h
                  </button>
                </div>
              </div>

              {/* Mobile: Per-hour accordion list (zero horizontal swipe) */}
              <div className="mt-4 max-h-96 overflow-y-auto rounded-xl border border-slate-200 md:hidden">
                {visibleHourly.map((hr) => (
                  <HourlyMobileRow key={hr.time} hr={hr} />
                ))}
              </div>

              {/* Desktop: Full 7-column table */}
              <div className="mt-4 hidden max-h-80 overflow-auto rounded-xl border border-slate-200 md:block">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-[#faf7f2] text-xs font-bold uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="px-3.5 py-2.5">Time</th>
                      <th className="px-3.5 py-2.5">Sky</th>
                      <th className="px-3.5 py-2.5">Temp / Feels</th>
                      <th className="px-3.5 py-2.5">Rain</th>
                      <th className="px-3.5 py-2.5">RH</th>
                      <th className="px-3.5 py-2.5">Wind / Gust</th>
                      <th className="px-3.5 py-2.5">UV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleHourly.map((hr) => (
                      <tr key={hr.time} className="hover:bg-slate-50/70">
                        <td className="px-3.5 py-2 font-mono text-xs font-medium text-[#0f2342]">
                          {formatDayLabel(hr.time.slice(0, 10)).split(',')[0]} {formatHourLabel(hr.time)}
                        </td>
                        <td className="px-3.5 py-2 text-slate-700">{describeWmoCode(hr.weatherCode)}</td>
                        <td className="px-3.5 py-2 font-mono tabular-nums">
                          <span className="font-semibold text-[#0f2342]">{hr.tempC.toFixed(0)}°</span>
                          <span className="text-slate-500">/{hr.apparentC.toFixed(0)}°</span>
                        </td>
                        <td className="px-3.5 py-2 font-mono tabular-nums">
                          <span className="font-semibold text-[#1976a8]">{hr.precipMm.toFixed(1)}mm</span>{' '}
                          <span className="text-slate-500">({hr.precipProbPct}%)</span>
                        </td>
                        <td className="px-3.5 py-2 font-mono tabular-nums text-slate-700">{hr.humidityPct}%</td>
                        <td className="px-3.5 py-2 font-mono tabular-nums text-slate-700">
                          {hr.windKmh.toFixed(0)}/{hr.gustKmh.toFixed(0)} km/h
                        </td>
                        <td className="px-3.5 py-2 font-mono tabular-nums text-slate-700">{hr.uvIndex.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6-Day Forecast (Always open, 2 cards per row on mobile, 6 on desktop) */}
          {data && (
            <div className="rounded-2xl border border-[#0f2342]/10 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-serif text-xl font-bold text-[#0f2342] sm:text-2xl">
                  6-Day Forecast
                </h2>
                <span className="text-xs font-medium text-slate-500">Next 6 days</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {nextSixDays.map((day) => (
                  <div
                    key={day.date}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5"
                  >
                    <div className="text-sm font-bold text-[#0f2342]">{formatDayLabel(day.date)}</div>
                    <div className="mt-0.5 truncate text-xs text-slate-600">{describeWmoCode(day.weatherCode)}</div>
                    <div className="mt-2 font-mono text-base font-bold tabular-nums text-[#0f2342]">
                      {day.tempMaxC.toFixed(0)}° / {day.tempMinC.toFixed(0)}°
                    </div>
                    <div className="text-xs font-semibold text-[#d1432a]">
                      Feels {day.apparentMaxC.toFixed(0)}°C
                    </div>
                    <div className="mt-2 border-t border-slate-200/80 pt-2 text-xs text-slate-600">
                      <div className="font-mono text-[#1976a8]">
                        {day.rainSumMm.toFixed(1)}mm ({day.probMaxPct}%)
                      </div>
                      <div className="font-mono">
                        {day.windMaxKmh.toFixed(0)}km/h · UV {day.uvMax.toFixed(0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hydrology & Official Hazard Portals — Equal Height in Desktop View */}
          <div className="grid items-stretch gap-5 lg:grid-cols-5 sm:gap-6">
            {data && (
              <div className="flex h-full flex-col justify-between rounded-2xl border border-[#0f2342]/10 bg-white p-4 shadow-sm sm:p-6 lg:col-span-3">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#0f2342] sm:text-2xl">
                    Agno River Discharge
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    GloFAS 10-day discharge (m³/s) for Alcala. Cross-check San Roque Dam (280.00 masl NHWL) &amp; Carmen Station during heavy rain.
                  </p>
                </div>

                <div className="mt-5 flex items-end gap-1.5 sm:gap-2">
                  {data.riverDischarge.map((day) => {
                    const heightPct = Math.max(8, Math.round((day.discharge / maxDischarge) * 100));
                    const isToday = day.date === todayIso;
                    const shortDate = formatDayLabel(day.date).split(',')[1]?.trim() || day.date.slice(5);
                    return (
                      <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                        <div className="font-mono text-[11px] sm:text-xs tabular-nums text-slate-500">
                          {day.discharge.toFixed(2)}
                        </div>
                        <div className="flex h-36 sm:h-44 w-full items-end rounded bg-slate-100 p-0.5">
                          <div
                            className={`w-full rounded-sm ${isToday ? 'bg-[#26489a]' : 'bg-[#1976a8]/75'}`}
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <div
                          className={`whitespace-nowrap text-[11px] sm:text-xs ${
                            isToday ? 'font-bold text-[#26489a]' : 'text-slate-500'
                          }`}
                        >
                          {shortDate}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex h-full flex-col justify-between rounded-2xl border border-[#0f2342]/10 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#0f2342] sm:text-2xl">
                  Official Hazard Portals
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  PAGASA, NAPOCOR, UP NOAH &amp; HazardHunterPH.
                </p>
              </div>
              <div className="mt-4 space-y-2.5">
                {OFFICIAL_WEATHER_LINKS.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3 transition hover:border-[#26489a] hover:bg-[#edf2fa]/40"
                  >
                    <div>
                      <div className="text-sm font-bold text-[#0f2342]">{link.title}</div>
                      <div className="text-xs text-slate-500">{link.agency}</div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-[#26489a]" />
                  </a>
                ))}
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
