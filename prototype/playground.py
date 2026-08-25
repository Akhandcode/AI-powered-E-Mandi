"""
PLAYGROUND -- change the numbers, run it, see what happens.

    python playground.py

This is the file to experiment with. Everything you can safely change is in the
SETTINGS block below, between the ==== lines. Change one thing, save the file,
run it again, and read how the recommendation moves.

Nothing here can break the rest of the project. If you mess it up badly, the
original is described in README.md.
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))

from data.loaders import QUALITY_WEIGHTS, load_agmarknet_prices, synthetic_prices
from pricing import forecast as fc
from pricing import router as rt

# ============================================================================
# SETTINGS -- CHANGE THESE
# ============================================================================

# What are you selling, and where?
COMMODITY = "Tomato"          # "Tomato", "Onion", or "Potato"
MARKET = "Ghaziabad"          # "Ghaziabad", "Hapur", or "Azadpur (Delhi)"

# How big is the lot? (1 quintal = 100 kg)
LOT_QUINTALS = 55.0

# What condition is the lot in? These must add up to 1.0.
# Try making it mostly fresh, then mostly rotten, and watch the advice change.
LOT_CONDITION = {
    "fresh":        0.30,
    "ripe":         0.28,
    "unripe":       0.12,
    "bruised":      0.14,
    "pest_damaged": 0.08,
    "infected":     0.05,
    "rotten":       0.03,
}

# How many days ahead should we forecast before deciding to wait?
HORIZON_DAYS = 7

# How much does the seller hate risk? 0 = doesn't care, 1.5 = very cautious
# (a farmer with a loan payment due next week is a high number).
RISK_AVERSION = 0.6

# ============================================================================
# END OF SETTINGS -- you don't need to change anything below
# ============================================================================

BAR = "=" * 68


def money(x):
    return f"Rs {x:,.0f}"


def bar_chart(value, maximum, width=28):
    n = int(round(width * value / maximum)) if maximum > 0 else 0
    return "#" * max(n, 0) + "." * (width - max(n, 0))


def main():
    # ---- sanity check the settings ------------------------------------
    total = sum(LOT_CONDITION.values())
    if abs(total - 1.0) > 0.01:
        print(f"\n  PROBLEM: your LOT_CONDITION values add up to {total:.2f}, not 1.00.")
        print("  Fix the numbers in the SETTINGS block so they sum to 1.0.\n")
        return 1
    unknown = set(LOT_CONDITION) - set(QUALITY_WEIGHTS)
    if unknown:
        print(f"\n  PROBLEM: unknown condition name(s): {unknown}")
        print(f"  Valid names are: {list(QUALITY_WEIGHTS)}\n")
        return 1

    # ---- Step 1: turn the condition mix into one quality number -------
    lqi = sum(LOT_CONDITION[c] * QUALITY_WEIGHTS[c] for c in LOT_CONDITION)

    print(f"\n{BAR}\n  YOUR LOT\n{BAR}")
    print(f"  {LOT_QUINTALS:.0f} quintals of {COMMODITY} "
          f"({LOT_QUINTALS * 100:,.0f} kg) at {MARKET} mandi\n")
    for c, share in sorted(LOT_CONDITION.items(), key=lambda kv: -kv[1]):
        if share > 0:
            print(f"    {c:<14} {share:>5.0%}  {bar_chart(share, 0.5)}")
    print(f"\n  Lot Quality Index = {lqi:.3f}   (1.0 = perfect, 0.0 = worthless)")
    print("  This single number is what drives every decision below.")

    # ---- Step 2: what is the market doing? -----------------------------
    prices = synthetic_prices()
    ser = prices[(prices.commodity == COMMODITY) & (prices.market == MARKET)].copy()
    ref = prices[(prices.commodity == COMMODITY) &
                 (prices.market == "Azadpur (Delhi)")].copy()
    spot = float(ser["modal_price"].iloc[-1])
    point, _ = fc.fit_final_and_forecast(ser, HORIZON_DAYS, ref)

    print(f"\n{BAR}\n  THE MARKET\n{BAR}")
    print(f"  Price today (modal):        {money(spot)} per quintal")
    print(f"  Forecast in {HORIZON_DAYS} days:        {money(point)} per quintal"
          f"   ({(point/spot - 1):+.1%})")

    # honest uncertainty from a real backtest, not from in-sample residuals
    res, frame = fc.rolling_backtest(ser, horizon=HORIZON_DAYS, n_folds=3, reference=ref)
    best = min(res, key=lambda k: res[k]["MAE"])
    sigma = float(np.std(frame["actual"] - frame[best]))
    print(f"  Typical forecast error:     +/- {money(sigma)}")
    print(f"  (best model in backtest: '{best}' -- if that says 'naive', the fancy")
    print("   models did not beat simply guessing today's price. That is normal.)")

    # ---- Step 3: who should you sell to? -------------------------------
    ranked = rt.rank_channels(point, lqi, LOT_QUINTALS, COMMODITY)
    top_net = ranked[0]["net_rs"]

    print(f"\n{BAR}\n  WHO SHOULD YOU SELL TO?\n{BAR}")
    print(f"  {'Buyer':<30}{'Net money':>14}   vs best")
    print(f"  {'-' * 62}")
    for i, r in enumerate(ranked):
        gap = r["net_rs"] - top_net
        tag = "  <-- BEST" if i == 0 else f"  {money(gap)}"
        print(f"  {r['channel']:<30}{money(r['net_rs']):>14}{tag}")

    b = ranked[0]
    print(f"\n  Why '{b['channel']}' wins here:")
    print(f"    gross sale value        {money(b['gross_rs']):>12}")
    print(f"    minus commission        {money(-b['commission_rs']):>12}")
    print(f"    minus transport/packing {money(-b['logistics_rs']):>12}")
    print(f"    minus finance cost      {money(-b['finance_rs']):>12}")
    print(f"    {'-' * 36}")
    print(f"    net in your pocket      {money(b['net_rs']):>12}")
    print(f"    spoilage on the way:    {b['spoilage_loss_qtl']:.1f} quintals lost")

    # ---- Step 4: split the lot across buyers ---------------------------
    plan = rt.route_with_capacity(point, lqi, LOT_QUINTALS, COMMODITY)
    plan_total = sum(p["net_rs"] for p in plan)

    print(f"\n{BAR}\n  SHOULD YOU SPLIT THE LOT?\n{BAR}")
    if len(plan) > 1:
        print("  The best-paying buyers take only small volumes, so the lot has")
        print("  to be spread across several of them:\n")
    else:
        print("  One buyer can absorb this entire lot, so no split is needed:\n")
    for p in plan:
        print(f"    {p['allocated_qtl']:>5.1f} qtl -> {p['channel']:<30}"
              f"{money(p['net_rs']):>12}")
    print(f"    {'-' * 60}")
    print(f"    {LOT_QUINTALS:>5.0f} qtl    TOTAL{'':<25}{money(plan_total):>12}")
    diff = plan_total - top_net
    if diff > 0:
        print(f"\n  Splitting earns {money(diff)} more than using one buyer.")
    else:
        print("\n  Splitting does not help for this lot -- one buyer is fine.")

    # ---- Step 5: sell now or wait? -------------------------------------
    d = rt.sell_now_or_wait(spot, point, sigma, lqi, LOT_QUINTALS,
                            COMMODITY, HORIZON_DAYS, RISK_AVERSION)

    print(f"\n{BAR}\n  SELL NOW, OR WAIT {HORIZON_DAYS} DAYS?\n{BAR}")
    print(f"  Sell today:                    {money(d['net_if_sell_now'])}")
    print(f"  Wait {HORIZON_DAYS} days (expected):      {money(d['net_if_wait_expected'])}")
    print(f"  Wait, adjusted for risk:       {money(d['net_if_wait_risk_adjusted'])}")
    print(f"\n  If you wait, you lose {d['spoilage_loss_qtl']:.1f} quintals to spoilage")
    print(f"  and quality drops from {lqi:.3f} to {d['lqi_after_wait']:.3f}.")
    print(f"\n  >>> RECOMMENDATION: {d['recommendation']}  "
          f"(worth {money(abs(d['edge_rs']))})")

    # ---- Step 6: sensitivity -- what if quality were different? --------
    print(f"\n{BAR}\n  WHAT IF THE QUALITY WERE DIFFERENT?\n{BAR}")
    print("  Same lot size, same prices -- only quality changes:\n")
    print(f"  {'Quality':<10}{'Best buyer':<32}{'Net money':>14}")
    print(f"  {'-' * 58}")
    for q in [0.15, 0.30, 0.45, 0.60, 0.75, 0.90, 1.00]:
        r = rt.rank_channels(point, q, LOT_QUINTALS, COMMODITY)[0]
        here = " <-- you" if abs(q - lqi) < 0.075 else ""
        print(f"  {q:<10.2f}{r['channel']:<32}{money(r['net_rs']):>14}{here}")
    print("\n  Notice the buyer CHANGES as quality falls. That is the whole point")
    print("  of the project: bad lots must be dumped fast to whoever takes volume,")
    print("  because they rot faster than the price premium can pay for the wait.")

    print(f"\n{BAR}")
    print("  Now go change LOT_CONDITION at the top of this file and run again.")
    print(f"{BAR}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
