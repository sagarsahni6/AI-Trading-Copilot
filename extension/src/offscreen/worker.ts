// ============================================================
// Offscreen Worker — Heavy computation in background context
// ============================================================
// This runs in an offscreen document to handle CPU-intensive
// calculations without blocking the service worker or UI
// ============================================================

console.log('[Offscreen Worker] Initialized');

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const msg = message as Record<string, unknown>;

  switch (msg.type) {
    case 'CALCULATE_GREEKS': {
      const result = calculateGreeks(msg.payload as GreeksInput);
      sendResponse({ success: true, data: result });
      break;
    }

    case 'CALCULATE_MAX_PAIN': {
      const result = calculateMaxPain(msg.payload as MaxPainInput);
      sendResponse({ success: true, data: result });
      break;
    }

    default:
      return false;
  }

  return true;
});

// ---- Greeks Calculator (Black-Scholes) ----

interface GreeksInput {
  spotPrice: number;
  strikePrice: number;
  timeToExpiry: number; // in years
  riskFreeRate: number;
  volatility: number;  // IV as decimal
  optionType: 'CE' | 'PE';
}

interface GreeksOutput {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  theoreticalPrice: number;
}

function calculateGreeks(input: GreeksInput): GreeksOutput {
  const { spotPrice: S, strikePrice: K, timeToExpiry: T, riskFreeRate: r, volatility: sigma, optionType } = input;

  if (T <= 0 || sigma <= 0) {
    return { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0, theoreticalPrice: 0 };
  }

  const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  const nd1 = normalCDF(d1);
  const nd2 = normalCDF(d2);
  const nnd1 = normalCDF(-d1);
  const nnd2 = normalCDF(-d2);
  const npd1 = normalPDF(d1);

  let delta: number;
  let theoreticalPrice: number;
  let theta: number;
  let rho: number;

  if (optionType === 'CE') {
    delta = nd1;
    theoreticalPrice = S * nd1 - K * Math.exp(-r * T) * nd2;
    theta = (-S * npd1 * sigma / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * nd2) / 365;
    rho = K * T * Math.exp(-r * T) * nd2 / 100;
  } else {
    delta = nd1 - 1;
    theoreticalPrice = K * Math.exp(-r * T) * nnd2 - S * nnd1;
    theta = (-S * npd1 * sigma / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * nnd2) / 365;
    rho = -K * T * Math.exp(-r * T) * nnd2 / 100;
  }

  const gamma = npd1 / (S * sigma * Math.sqrt(T));
  const vega = S * npd1 * Math.sqrt(T) / 100;

  return {
    delta: Number(delta.toFixed(4)),
    gamma: Number(gamma.toFixed(6)),
    theta: Number(theta.toFixed(4)),
    vega: Number(vega.toFixed(4)),
    rho: Number(rho.toFixed(4)),
    theoreticalPrice: Number(theoreticalPrice.toFixed(2)),
  };
}

// ---- Max Pain Calculator ----

interface MaxPainInput {
  strikes: Array<{
    strikePrice: number;
    callOI: number;
    putOI: number;
  }>;
  spotPrice: number;
}

function calculateMaxPain(input: MaxPainInput): { maxPain: number; pain: Array<{ strike: number; totalPain: number }> } {
  const { strikes } = input;
  const painAtEachStrike: Array<{ strike: number; totalPain: number }> = [];

  for (const expiry of strikes) {
    let totalPain = 0;

    for (const s of strikes) {
      // Call pain: max(0, expiryStrike - strike) * callOI
      if (expiry.strikePrice > s.strikePrice) {
        totalPain += (expiry.strikePrice - s.strikePrice) * s.callOI;
      }
      // Put pain: max(0, strike - expiryStrike) * putOI
      if (s.strikePrice > expiry.strikePrice) {
        totalPain += (s.strikePrice - expiry.strikePrice) * s.putOI;
      }
    }

    painAtEachStrike.push({ strike: expiry.strikePrice, totalPain });
  }

  // Max Pain = strike with minimum total pain
  const sorted = [...painAtEachStrike].sort((a, b) => a.totalPain - b.totalPain);
  const maxPain = sorted[0]?.strike ?? 0;

  return { maxPain, pain: painAtEachStrike };
}

// ---- Math Helpers ----

function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327; // 1/sqrt(2*PI)
  const p = d * Math.exp(-x * x / 2) *
    (0.3193815 * t - 0.3565638 * t * t + 1.781478 * t * t * t -
      1.821256 * t * t * t * t + 1.330274 * t * t * t * t * t);
  return x > 0 ? 1 - p : p;
}

function normalPDF(x: number): number {
  return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
}
