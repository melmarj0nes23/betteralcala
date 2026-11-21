import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface DailyPoint {
  day: string;
  maxTemp: number;
  minTemp: number;
  icon: string;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  dailyForecast: DailyPoint[];
  isFallback: boolean;
}

function mapWeatherCode(code: number): { condition: string; icon: string } {
  const mappings: Record<number, { condition: string; icon: string }> = {
    0: { condition: 'Clear sky', icon: 'bi-sun-fill' },
    1: { condition: 'Mainly clear', icon: 'bi-cloud-sun-fill' },
    2: { condition: 'Partly cloudy', icon: 'bi-cloud-sun-fill' },
    3: { condition: 'Overcast', icon: 'bi-clouds-fill' },
    45: { condition: 'Foggy', icon: 'bi-cloud-fog-fill' },
    48: { condition: 'Depositing rime fog', icon: 'bi-cloud-fog-fill' },
    51: { condition: 'Light drizzle', icon: 'bi-cloud-drizzle-fill' },
    53: { condition: 'Moderate drizzle', icon: 'bi-cloud-drizzle-fill' },
    55: { condition: 'Dense drizzle', icon: 'bi-cloud-drizzle-fill' },
    61: { condition: 'Slight rain', icon: 'bi-cloud-rain-fill' },
    63: { condition: 'Moderate rain', icon: 'bi-cloud-rain-fill' },
    65: { condition: 'Heavy rain', icon: 'bi-cloud-rain-heavy-fill' },
    80: { condition: 'Rain showers', icon: 'bi-cloud-rain-fill' },
    95: { condition: 'Thunderstorm', icon: 'bi-cloud-lightning-rain-fill' },
  };
  return mappings[code] || { condition: 'Partly cloudy', icon: 'bi-cloud-sun-fill' };
}

function formatDayLabel(isoDate: string, idx: number): string {
  if (idx === 0) return 'Today';
  try {
    const [y, m, d] = isoDate.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      timeZone: 'Asia/Manila',
    }).format(dt);
  } catch {
    return `Day ${idx + 1}`;
  }
}

function getFallbackWeather(): WeatherData {
  const now = new Date();
  const dailyForecast: DailyPoint[] = [];
  for (let i = 0; i < 6; i++) {
    const dt = new Date(now.getTime() + i * 86400000);
    const label =
      i === 0
        ? 'Today'
        : new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Asia/Manila' }).format(
            dt
          );
    dailyForecast.push({
      day: label,
      maxTemp: 31 - (i % 2),
      minTemp: 23 + (i % 2),
      icon: i % 3 === 1 ? 'bi-cloud-drizzle-fill' : 'bi-cloud-sun-fill',
    });
  }
  return {
    temperature: 29,
    humidity: 66,
    windSpeed: 11,
    condition: 'Partly cloudy',
    icon: 'bi-cloud-sun-fill',
    dailyForecast,
    isFallback: true,
  };
}

export default function WeatherMapSection() {
  const { t } = useLanguage();
  const [weather, setWeather] = useState<WeatherData>(getFallbackWeather);

  useEffect(() => {
    const cacheKey = 'alcala_weather_card_v4';
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const entry = JSON.parse(cached);
        if (entry?.data?.dailyForecast && Date.now() < entry.expiresAt) {
          setWeather(entry.data);
          return;
        }
      }
    } catch {
      // ignore
    }

    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=15.8467&longitude=120.5219&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=6&timezone=Asia%2FManila'
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.current) return;
        const mapped = mapWeatherCode(data.current.weather_code ?? 1);
        const dailyForecast: DailyPoint[] = [];
        if (data.daily?.time && data.daily?.temperature_2m_max) {
          const count = Math.min(6, data.daily.time.length);
          for (let i = 0; i < count; i++) {
            const code = data.daily.weather_code?.[i] ?? 1;
            dailyForecast.push({
              day: formatDayLabel(data.daily.time[i], i),
              maxTemp: Math.round(data.daily.temperature_2m_max[i]),
              minTemp: Math.round(data.daily.temperature_2m_min?.[i] ?? data.daily.temperature_2m_max[i] - 6),
              icon: mapWeatherCode(code).icon,
            });
          }
        }
        const live: WeatherData = {
          temperature: Math.round(data.current.temperature_2m),
          humidity: Math.round(data.current.relative_humidity_2m ?? 65),
          windSpeed: Math.round(data.current.wind_speed_10m ?? 10),
          condition: mapped.condition,
          icon: mapped.icon,
          dailyForecast:
            dailyForecast.length > 0 ? dailyForecast : getFallbackWeather().dailyForecast,
          isFallback: false,
        };
        setWeather(live);
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ data: live, expiresAt: Date.now() + 30 * 60 * 1000 })
          );
        } catch {
          // ignore
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="section weather-map-section">
      <div className="container">
        <div className="home-stats-v2-header">
          <h2>{t('home-weather-and-map')}</h2>
        </div>

        <div className="weather-map-grid">
          <div className="weather-column">
            <div id="weather-container" aria-live="polite">
              <div className="weather-widget">
                <div className="weather-current">
                  <div className="weather-current-icon">
                    <i className={`bi ${weather.icon}`} aria-hidden="true" />
                  </div>
                  <div className="weather-current-info">
                    <div className="weather-current-temp tabular-nums">{weather.temperature}°C</div>
                    <div className="weather-current-condition">{weather.condition}</div>
                    <div className="weather-current-location">
                      <i className="bi bi-geo-alt-fill" aria-hidden="true" />
                      <span>
                        Alcala, Pangasinan · {weather.isFallback ? 'Estimated' : 'Live (PHT)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="weather-stats">
                  <div className="weather-stat">
                    <i className="bi bi-droplet" aria-hidden="true" />
                    <span className="tabular-nums">Humidity {weather.humidity}%</span>
                  </div>
                  <div className="weather-stat">
                    <i className="bi bi-wind" aria-hidden="true" />
                    <span className="tabular-nums">Wind {weather.windSpeed} km/h</span>
                  </div>
                </div>

                <div className="weather-hourly">
                  {weather.dailyForecast.map((d, i) => (
                    <div key={`${d.day}-${i}`} className="weather-hour">
                      <span className="weather-hour-time">{d.day}</span>
                      <i className={`bi ${d.icon}`} aria-hidden="true" />
                      <span className="weather-hour-temp tabular-nums">
                        {d.maxTemp}°
                      </span>
                      <span className="text-[10px] text-slate-500 tabular-nums leading-none">
                        {d.minTemp}°
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#0f2342]">
                      <i className="bi bi-clock text-[#26489A]" aria-hidden="true" />
                      <span>Municipal Hall Hours</span>
                    </span>
                    <span className="tabular-nums">Mon–Fri, 8 AM – 5 PM</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#0f2342]">
                      <i className="bi bi-shield-exclamation text-[#D1432A]" aria-hidden="true" />
                      <span>MDRRMO 24/7 Hotline</span>
                    </span>
                    <a
                      href="tel:09209817724"
                      className="font-bold text-[#D1432A] hover:underline tabular-nums"
                    >
                      0920-9817724
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="map-column">
            <div className="map-card">
              <div
                id="map-container"
                role="application"
                aria-label="Interactive map of Alcala, Pangasinan"
              >
                <iframe
                  id="osm-embed"
                  className="map-iframe"
                  src="https://maps.google.com/maps?ll=15.8467,120.5219&z=15&output=embed"
                  title="Map of Alcala, Pangasinan"
                  aria-label="Map showing Alcala Municipal Hall, Poblacion East, Pangasinan"
                  referrerPolicy="no-referrer-when-downgrade"
                  loading="lazy"
                />
              </div>
              <p className="map-attribution px-3 sm:px-0">
                <i className="bi bi-geo-alt" aria-hidden="true" />{' '}
                <span>
                  Alcala Municipal Hall, Poblacion East, Alcala, 2425 Pangasinan (15°50′48″N
                  120°31′19″E)
                </span>
              </p>
              <div className="flex flex-wrap gap-3 mt-2 px-3 sm:px-0 pb-1 text-xs font-semibold">
                <a
                  href="https://www.openstreetmap.org/?mlat=15.8467&mlon=120.5219#map=15/15.8467/120.5219"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Full Map <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                </a>
                <a
                  href="https://www.openstreetmap.org/directions?to=15.8467%2C120.5219"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Directions to Municipal Hall{' '}
                  <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
