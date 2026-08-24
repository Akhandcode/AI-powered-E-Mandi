"""
STAGE C2 -- channel economics and routing.

ALL NUMBERS IN `CHANNELS` ARE PLACEHOLDERS. Replace them with figures from
APMC published commission rates and your own trader interviews before you put
any of this in your report. The *structure* is the contribution; the constants
are yours to measure.
"""
from __future__ import annotations

from dataclasses import dataclass, field, asdict

import numpy as np


@dataclass
class Channel:
    name: str
    price_factor: float        # multiplier on mandi modal price
    commission_pct: float      # commission + APMC fee, as fraction of gross
    transport_per_qtl: float   # Rs/quintal
    packing_per_qtl: float     # Rs/quintal
    days_to_sale: float        # spoilage exposure window
    payment_delay_days: float  # working-capital cost driver
    max_qtl: float             # volume this channel can absorb per transaction
    quality_sensitivity: float # how hard poor quality is punished, 0..1.5


CHANNELS = [
    Channel("Middleman / commission agent", 0.84, 0.02, 0,   20,  0.5, 0,   1e9, 0.35),
    Channel("Wholesaler (mandi)",           0.96, 0.07, 120, 60,  1.0, 3,   1e9, 0.70),
    Channel("Retailer / vendor",            1.24, 0.00, 260, 130, 3.0, 7,   40,  1.05),
    Channel("Direct consumer / FPO",        1.58, 0.00, 380, 200, 5.0, 0,   12,  1.35),
]

DAILY_INTEREST = 0.12 / 365      # working capital cost, ~12% p.a.

# Daily spoilage rate as a function of current quality. Poor lots rot fast --
# this convexity is what makes routing non-obvious.
SPOILAGE_BASE = {"Tomato": 0.055, "Onion": 0.018, "Potato": 0.012}


def spoilage_loss(lqi: float, days: float, commodity: str) -> float:
    """Fraction of the lot lost over `days`, given current quality."""
    base = SPOILAGE_BASE.get(commodity, 0.03)
    rate = base * (1 + 2.6 * (1 - lqi) ** 2)   # convex in poor quality
    return float(1 - np.exp(-rate * days))


def quality_multiplier(lqi: float, sensitivity: float) -> float:
    """Price realised relative to a perfect lot.

    Anchor for calibration: Agmarknet grade-price spreads. A quality-sensitive
    channel (direct consumer) punishes a poor lot far harder than a middleman
    buying to liquidate.
    """
    return float(np.clip(1 - sensitivity * (1 - lqi), 0.05, 1.15))


def evaluate_channel(ch: Channel, base_price: float, lqi: float,
                     qty_qtl: float, commodity: str) -> dict:
    sellable = qty_qtl * (1 - spoilage_loss(lqi, ch.days_to_sale, commodity))
    unit_gross = base_price * ch.price_factor * quality_multiplier(lqi, ch.quality_sensitivity)
    gross = unit_gross * sellable

    commission = gross * ch.commission_pct
    logistics = (ch.transport_per_qtl + ch.packing_per_qtl) * qty_qtl
    finance = gross * DAILY_INTEREST * (ch.payment_delay_days + ch.days_to_sale)

    net = gross - commission - logistics - finance
    return {
        "channel": ch.name,
        "capacity_qtl": ch.max_qtl,
        "unit_gross_rs_qtl": unit_gross,
        "sellable_qtl": sellable,
        "spoilage_loss_qtl": qty_qtl - sellable,
        "gross_rs": gross,
        "commission_rs": commission,
        "logistics_rs": logistics,
        "finance_rs": finance,
        "net_rs": net,
        "net_per_qtl": net / qty_qtl if qty_qtl else 0.0,
    }


def rank_channels(base_price, lqi, qty_qtl, commodity):
    rows = [evaluate_channel(c, base_price, lqi, qty_qtl, commodity) for c in CHANNELS]
    return sorted(rows, key=lambda r: -r["net_rs"])


def route_with_capacity(base_price, lqi, qty_qtl, commodity):
    """Greedy allocation respecting per-channel volume caps.

    A 60-quintal lot cannot all go to direct consumers, however good the margin
    is -- capacity is the binding constraint real sellers hit.
    """
    remaining = qty_qtl
    plan = []
    by_rate = sorted(
        CHANNELS,
        key=lambda c: -evaluate_channel(c, base_price, lqi, 1.0, commodity)["net_per_qtl"],
    )
    for ch in by_rate:
        if remaining <= 1e-9:
            break
        take = min(remaining, ch.max_qtl)
        r = evaluate_channel(ch, base_price, lqi, take, commodity)
        r["allocated_qtl"] = take
        plan.append(r)
        remaining -= take
    return plan


def sell_now_or_wait(spot_price, forecast_price, forecast_sigma, lqi, qty_qtl,
                     commodity, horizon_days, risk_aversion=0.6):
    """Compare selling today against holding for the forecast horizon.

    Holding gains price appreciation but loses mass to spoilage and incurs
    storage/finance cost. Risk-adjusted via a mean-variance penalty, because a
    farmer with a loan due is not risk-neutral.
    """
    now = rank_channels(spot_price, lqi, qty_qtl, commodity)[0]["net_rs"]

    loss = spoilage_loss(lqi, horizon_days, commodity)
    lqi_later = max(lqi * (1 - 0.45 * loss), 0.0)   # survivors also degrade
    qty_later = qty_qtl * (1 - loss)
    later_rows = rank_channels(forecast_price, lqi_later, qty_later, commodity)
    later = later_rows[0]["net_rs"]
    storage = 22 * qty_qtl * horizon_days / 7      # Rs/qtl/week placeholder
    later -= storage

    # uncertainty in the held payoff, scaled to the quantity actually surviving
    sigma_rs = forecast_sigma * qty_later
    utility_wait = later - risk_aversion * sigma_rs

    return {
        "net_if_sell_now": now,
        "net_if_wait_expected": later,
        "net_if_wait_risk_adjusted": utility_wait,
        "spoilage_loss_qtl": qty_qtl - qty_later,
        "storage_cost_rs": storage,
        "lqi_after_wait": lqi_later,
        "best_channel_if_wait": later_rows[0]["channel"],
        "recommendation": "WAIT" if utility_wait > now else "SELL NOW",
        "edge_rs": utility_wait - now,
    }


def channel_table():
    return [asdict(c) for c in CHANNELS]
