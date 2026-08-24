"""
Data loaders.

SEAM #1 -------------------------------------------------------------------
`synthetic_prices()` is a stand-in for your real Agmarknet archive.
Replace it with a reader over your accumulated data.gov.in dump. Keep the
returned schema identical and every downstream module keeps working:

    columns = [date, commodity, market, min_price, max_price, modal_price, arrivals]
    modal_price in Rs/quintal, date is datetime64[ns], one row per (date, commodity, market)

`synthetic_images()` is a stand-in for your labelled photo dataset.
Replace with an ImageFolder-style reader once you have real images.
---------------------------------------------------------------------------
"""
from __future__ import annotations

import numpy as np
import pandas as pd

CONDITIONS = ["fresh", "ripe", "unripe", "bruised", "pest_damaged", "infected", "rotten"]

# Quality weight per condition, w_c in [0,1]. See PROJECT_PLAN.md section 4:
# these MUST be re-derived from Agmarknet grade-price spreads or trader surveys.
QUALITY_WEIGHTS = {
    "fresh": 1.00,
    "ripe": 0.95,
    "unripe": 0.70,
    "bruised": 0.55,
    "pest_damaged": 0.35,
    "infected": 0.15,
    "rotten": 0.00,
}

COMMODITIES = ["Tomato", "Onion", "Potato"]
MARKETS = ["Ghaziabad", "Hapur", "Azadpur (Delhi)"]

# Rough real-world anchors (Rs/quintal) so the synthetic series is not absurd.
_BASE = {"Tomato": 1900.0, "Onion": 2100.0, "Potato": 1250.0}
_SEASONAL_AMP = {"Tomato": 0.42, "Onion": 0.30, "Potato": 0.20}
_VOL = {"Tomato": 0.055, "Onion": 0.035, "Potato": 0.025}
_PEAK_DOY = {"Tomato": 200, "Onion": 300, "Potato": 250}


def synthetic_prices(start="2023-06-06", end="2026-08-20", seed=7) -> pd.DataFrame:
    """Mandi-like daily price panel: seasonality + AR(1) shocks + spikes + inflation."""
    rng = np.random.default_rng(seed)
    dates = pd.date_range(start, end, freq="D")
    t = np.arange(len(dates))
    doy = dates.dayofyear.to_numpy()
    rows = []

    for com in COMMODITIES:
        # persistent shock process -- commodity prices are strongly autocorrelated
        shock = np.zeros(len(dates))
        eps = rng.normal(0, _VOL[com], len(dates))
        for i in range(1, len(dates)):
            shock[i] = 0.94 * shock[i - 1] + eps[i]

        # occasional supply-shock spikes (the tomato/onion story)
        spikes = np.zeros(len(dates))
        n_spikes = rng.poisson(3.0 * len(dates) / 365)
        for _ in range(n_spikes):
            s = rng.integers(0, len(dates))
            mag = rng.uniform(0.35, 1.30)
            dur = rng.integers(12, 45)
            decay = np.exp(-np.arange(len(dates) - s) / (dur / 3))
            spikes[s:] += mag * decay

        season = _SEASONAL_AMP[com] * np.sin(2 * np.pi * (doy - _PEAK_DOY[com]) / 365.25)
        inflation = (1.055) ** (t / 365.25)  # ~5.5% nominal drift per year

        base = _BASE[com] * (1 + season) * np.exp(shock) * (1 + spikes) * inflation

        for mkt in MARKETS:
            # market-specific level + idiosyncratic noise; Azadpur is the benchmark
            level = {"Ghaziabad": 0.97, "Hapur": 0.94, "Azadpur (Delhi)": 1.00}[mkt]
            noise = rng.normal(1.0, 0.020, len(dates))
            modal = base * level * noise
            spread = rng.uniform(0.08, 0.18, len(dates))
            arrivals = np.maximum(
                rng.lognormal(np.log(220), 0.45, len(dates)) * (1 - 0.35 * season), 5
            )
            rows.append(
                pd.DataFrame(
                    {
                        "date": dates,
                        "commodity": com,
                        "market": mkt,
                        "modal_price": modal.round(0),
                        "min_price": (modal * (1 - spread)).round(0),
                        "max_price": (modal * (1 + spread)).round(0),
                        "arrivals": arrivals.round(1),
                    }
                )
            )

    return pd.concat(rows, ignore_index=True).sort_values(["commodity", "market", "date"])


def synthetic_cpi(prices: pd.DataFrame) -> pd.DataFrame:
    """Monthly CPI-AL stand-in, indexed to 100 at series start."""
    months = pd.date_range(prices["date"].min(), prices["date"].max(), freq="MS")
    n = len(months)
    idx = 100 * (1.052 ** (np.arange(n) / 12))
    return pd.DataFrame({"month": months, "cpi": idx.round(2)})


# ---------------------------------------------------------------------------
# Synthetic image generation -- stand-in for the Kaggle / field photo dataset
# ---------------------------------------------------------------------------

def _render_unit(condition: str, commodity: str, rng, size=96) -> np.ndarray:
    """Procedurally render one vegetable unit with condition-specific defects.

    This exists ONLY so the pipeline runs end-to-end with zero downloads.
    Real project: delete this, use your photos.
    """
    yy, xx = np.mgrid[0:size, 0:size]
    cx, cy = size / 2 + rng.normal(0, 3), size / 2 + rng.normal(0, 3)
    r = size * rng.uniform(0.33, 0.42)
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    mask = dist < r

    hues = {
        "Tomato": {"ripe": (205, 45, 35), "unripe": (140, 175, 70)},
        "Onion": {"ripe": (175, 120, 70), "unripe": (200, 175, 120)},
        "Potato": {"ripe": (185, 150, 105), "unripe": (170, 160, 110)},
    }[commodity]

    base = np.array(hues["unripe"] if condition == "unripe" else hues["ripe"], float)

    img = np.ones((size, size, 3)) * np.array([235, 235, 230])  # pale background
    shade = 1 - 0.45 * (dist / (r + 1e-6)).clip(0, 1) ** 2  # spherical shading
    body = base[None, None, :] * shade[:, :, None]
    img[mask] = body[mask]

    def blob(n, rad_lo, rad_hi, colour, jitter=25):
        for _ in range(n):
            ang, rad = rng.uniform(0, 2 * np.pi), rng.uniform(0, r * 0.8)
            bx, by = cx + rad * np.cos(ang), cy + rad * np.sin(ang)
            br = rng.uniform(rad_lo, rad_hi) * size / 96
            bm = (np.sqrt((xx - bx) ** 2 + (yy - by) ** 2) < br) & mask
            img[bm] = np.array(colour) + rng.normal(0, jitter, 3)

    if condition == "bruised":
        blob(rng.integers(1, 3), 5, 11, (110, 80, 60))
    elif condition == "pest_damaged":
        blob(rng.integers(3, 9), 1.5, 4, (55, 40, 30))       # small boreholes
    elif condition == "infected":
        blob(rng.integers(2, 5), 6, 13, (215, 210, 190), 12)  # pale fungal patches
        blob(rng.integers(2, 6), 2, 5, (95, 105, 80))
    elif condition == "rotten":
        blob(rng.integers(4, 8), 8, 18, (70, 55, 45))
        img[mask] *= 0.72
        blob(rng.integers(1, 4), 5, 12, (190, 190, 175), 15)  # mould bloom
    elif condition == "fresh":
        blob(1, 3, 6, (255, 255, 255), 5)                     # specular highlight

    img += rng.normal(0, 5, img.shape)                        # sensor noise
    img *= rng.uniform(0.82, 1.15)                            # lighting variation
    return img.clip(0, 255).astype(np.uint8)


def synthetic_images(n_per_class=110, commodity="Tomato", seed=0):
    """Returns (images: list[np.ndarray], labels: list[str])."""
    rng = np.random.default_rng(seed)
    imgs, labels = [], []
    for c in CONDITIONS:
        for _ in range(n_per_class):
            imgs.append(_render_unit(c, commodity, rng))
            labels.append(c)
    return imgs, labels
