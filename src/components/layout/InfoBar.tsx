import { useEffect, useState } from 'react';

interface RateItem {
  code: string;
  rate: string;
}

export default function InfoBar() {
  const [rates, setRates] = useState<RateItem[]>([
    { code: 'USD', rate: '58.40' },
    { code: 'EUR', rate: '61.50' },
    { code: 'SAR', rate: '15.55' },
  ]);
  const [rateIndex, setRateIndex] = useState(0);
  const [temp, setTemp] = useState<string>('29°C');
  const [dateStr, setDateStr] = useState<string>('');
  const [timeStr, setTimeStr] = useState<string>('');

  // Live PHT Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      try {
        const dFmt = new Intl.DateTimeFormat('en-PH', {
          timeZone: 'Asia/Manila',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(now);
        const tFmt = new Intl.DateTimeFormat('en-PH', {
          timeZone: 'Asia/Manila',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(now);
        setDateStr(dFmt);
        setTimeStr(tFmt);
      } catch {
        setDateStr(now.toDateString());
        setTimeStr(now.toLocaleTimeString());
      }
    };
    updateClock();
    const timer = setInterval(updateClock, 15000);
    return () => clearInterval(timer);
  }, []);

  // Rotate exchange rates
  useEffect(() => {
    const rot = setInterval(() => {
      setRateIndex((prev) => (prev + 1) % rates.length);
    }, 4500);
    return () => clearInterval(rot);
  }, [rates.length]);

  // Fetch live Alcala weather (15.8467, 120.5219) and PHP FX rates
  useEffect(() => {
    const weatherCacheKey = 'alcala_infobar_weather';
    let hasFreshWeather = false;
    try {
      const cached = localStorage.getItem(weatherCacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Date.now() < parsed.expiresAt && parsed.temp) {
          setTemp(parsed.temp);
          hasFreshWeather = true;
        }
      }
    } catch {
      // ignore
    }

    if (!hasFreshWeather) {
      fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=15.8467&longitude=120.5219&current=temperature_2m&timezone=Asia%2FManila'
      )
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.current?.temperature_2m !== undefined) {
            const val = `${Math.round(data.current.temperature_2m)}°C`;
            setTemp(val);
            try {
              localStorage.setItem(
                weatherCacheKey,
                JSON.stringify({ temp: val, expiresAt: Date.now() + 30 * 60 * 1000 })
              );
            } catch {
              // ignore
            }
          }
        })
        .catch(() => {});
    }

    const fxCacheKey = 'alcala_infobar_fx';
    try {
      const cachedFx = localStorage.getItem(fxCacheKey);
      if (cachedFx) {
        const parsedFx = JSON.parse(cachedFx);
        if (parsedFx && Date.now() < parsedFx.expiresAt && Array.isArray(parsedFx.rates)) {
          setRates(parsedFx.rates);
          return;
        }
      }
    } catch {
      // ignore
    }

    fetch('https://open.er-api.com/v6/latest/USD')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.rates?.PHP) {
          const phpPerUsd = data.rates.PHP;
          const nextRates: RateItem[] = [{ code: 'USD', rate: phpPerUsd.toFixed(2) }];
          if (data.rates.EUR) {
            nextRates.push({ code: 'EUR', rate: (phpPerUsd / data.rates.EUR).toFixed(2) });
          }
          if (data.rates.SAR) {
            nextRates.push({ code: 'SAR', rate: (phpPerUsd / data.rates.SAR).toFixed(2) });
          }
          setRates(nextRates);
          try {
            localStorage.setItem(
              fxCacheKey,
              JSON.stringify({ rates: nextRates, expiresAt: Date.now() + 6 * 60 * 60 * 1000 })
            );
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {});
  }, []);

  const currentRate = rates[rateIndex] || rates[0];

  const getHallStatus = (): string => {
    try {
      const now = new Date();
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        weekday: 'short',
        hour: 'numeric',
        hour12: false,
      }).formatToParts(now);
      const day = parts.find((p) => p.type === 'weekday')?.value || '';
      const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
      const isWeekday = !['Sat', 'Sun'].includes(day);
      return isWeekday && hour >= 8 && hour < 17
        ? 'Municipal Hall: Open Now (until 5:00 PM)'
        : 'Municipal Hall: Mon–Fri 8:00 AM–5:00 PM';
    } catch {
      return 'Municipal Hall: Mon–Fri 8:00 AM–5:00 PM';
    }
  };

  return (
    <div className="info-bar" role="complementary" aria-label="Real-time information">
      <div className="container">
        <div className="info-bar-inner">
          <div className="info-bar-item hidden lg:inline-flex" aria-label="Municipal Hall hours">
            <i className="bi bi-building" aria-hidden="true" />
            <span>{getHallStatus()}</span>
          </div>

          <div className="info-bar-item info-bar-rates" aria-label="Exchange rates">
            <i className="bi bi-currency-exchange" aria-hidden="true" />
            <span className="rate-rotator">
              <span className="rate-display tabular-nums">
                1 {currentRate.code} = ₱ {currentRate.rate}
              </span>
            </span>
          </div>

          <div className="info-bar-item info-bar-weather" aria-label="Current weather in Alcala">
            <i className="bi bi-thermometer-half" aria-hidden="true" />
            <span className="weather-location">
              Alcala<span className="weather-location-province">, Pangasinan</span>
            </span>
            <span className="weather-temp tabular-nums">{temp}</span>
          </div>

          <div className="info-bar-item info-bar-datetime" aria-label="Philippine Date and Time">
            <i className="bi bi-calendar3" aria-hidden="true" />
            <span className="date-value">{dateStr}</span>
            <span className="datetime-separator" aria-hidden="true">
              ·
            </span>
            <i className="bi bi-clock" aria-hidden="true" />
            <span className="time-value tabular-nums">{timeStr}</span>
            <span className="time-label">PHT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
