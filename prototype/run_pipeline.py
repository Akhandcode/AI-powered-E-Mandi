"""
End-to-end demo: Stage A -> B -> C on synthetic stand-in data.

    python run_pipeline.py

Outputs into ./outputs/ :
    report.html          -- the dashboard
    grader_confusion.png
    sample_size_study.png
    price_backtest.png
    price_history.png
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))

from data.loaders import (CONDITIONS, QUALITY_WEIGHTS, synthetic_cpi,
                          synthetic_images, synthetic_prices, _render_unit)
from lot.estimator import estimate_lot, lqi_from_theta
from pricing import forecast as fc
from pricing import router as rt
from vision.grader import Grader

OUT = Path(__file__).parent / "outputs"
OUT.mkdir(exist_ok=True)

COMMODITY = "Tomato"
MARKET = "Ghaziabad"
HORIZON = 7
LOT_QUINTALS = 55.0
UNITS_PER_QTL = 700          # ~700 tomatoes per quintal
SAMPLE_N = 40

# --fast trades statistical smoothness for speed so you can iterate quickly.
FAST = "--fast" in sys.argv

plt.rcParams.update({"figure.dpi": 130, "font.size": 9,
                     "axes.grid": True, "grid.alpha": 0.25})
C_MAIN, C_ACC = "#2f6f4e", "#c1553b"


def log(m):
    print(f"  {m}", flush=True)


# ---------------------------------------------------------------- STAGE A
def stage_a():
    print("\n[STAGE A] Grader")
    imgs, labels = synthetic_images(n_per_class=45 if FAST else 110,
                                    commodity=COMMODITY, seed=1)
    log(f"{len(imgs)} images, {len(set(labels))} classes")
    g = Grader().fit(imgs, labels)
    log(f"held-out accuracy: {g.test_acc_:.3f}")

    cm = g.confusion_matrix_normalised()
    fig, ax = plt.subplots(figsize=(5.4, 4.4))
    im = ax.imshow(cm, cmap="Greens", vmin=0, vmax=1)
    ax.set_xticks(range(len(g.classes_)), g.classes_, rotation=45, ha="right")
    ax.set_yticks(range(len(g.classes_)), g.classes_)
    for i in range(len(g.classes_)):
        for j in range(len(g.classes_)):
            if cm[i, j] > 0.01:
                ax.text(j, i, f"{cm[i,j]:.2f}", ha="center", va="center", fontsize=7,
                        color="white" if cm[i, j] > 0.5 else "black")
    ax.set_xlabel("predicted"); ax.set_ylabel("true"); ax.grid(False)
    ax.set_title(f"Stage A confusion matrix (acc {g.test_acc_:.1%})")
    fig.colorbar(im, shrink=0.8); fig.tight_layout()
    fig.savefig(OUT / "grader_confusion.png"); plt.close(fig)
    return g


# ---------------------------------------------------------------- STAGE B
def make_lot(true_mix, n_units, seed=42):
    """Render a physical lot with a known true composition (ground truth)."""
    rng = np.random.default_rng(seed)
    classes = list(true_mix)
    probs = np.array([true_mix[c] for c in classes], float)
    probs /= probs.sum()
    draw = rng.choice(classes, size=n_units, p=probs)
    return [_render_unit(c, COMMODITY, rng) for c in draw], list(draw)


class CachedGrader:
    """Wraps the real grader but works on pre-extracted features.

    The sample-size study grades the same pool of images thousands of times.
    Extracting features once and reusing them makes it ~20x faster and changes
    no results. `images` here are integer indices into the cached matrix.
    """

    def __init__(self, grader, feature_matrix):
        self._g = grader
        self._F = feature_matrix
        self.classes_ = grader.classes_

    def predict_proba(self, idx):
        return self._g.clf.predict_proba(self._F[list(idx)])

    def confusion_matrix_normalised(self):
        return self._g.cm_


def stage_b(grader):
    print("\n[STAGE B] Sample -> lot inference")
    true_mix = {"fresh": .30, "ripe": .28, "unripe": .12, "bruised": .14,
                "pest_damaged": .08, "infected": .05, "rotten": .03}
    lot_units = int(LOT_QUINTALS * UNITS_PER_QTL)
    pool_imgs, pool_lbls = make_lot(true_mix, 160 if FAST else 260, seed=42)

    from vision.grader import extract_features
    pool_feats = np.array([extract_features(i) for i in pool_imgs])
    cg = CachedGrader(grader, pool_feats)

    w = np.array([QUALITY_WEIGHTS[c] for c in CONDITIONS])
    true_lqi = float(sum(true_mix[c] * QUALITY_WEIGHTS[c] for c in true_mix))
    log(f"true lot LQI (ground truth): {true_lqi:.3f}")

    rng = np.random.default_rng(0)
    idx = rng.choice(len(pool_imgs), SAMPLE_N, replace=False)
    est = estimate_lot(cg, list(idx), QUALITY_WEIGHTS, lot_units,
                       use_debias=True, seed=3)
    lo, hi = est.interval(0.90)
    log(f"estimated LQI from n={SAMPLE_N}: {est.lqi:.3f}  90% CI [{lo:.3f}, {hi:.3f}]")
    log(f"covers truth: {lo <= true_lqi <= hi}")

    # ---- error vs sample size, with and without confusion de-biasing
    sizes = [5, 15, 40, 80, 160] if FAST else [5, 10, 15, 20, 30, 40, 60, 80, 120, 160]
    n_trials = 6 if FAST else 14
    curves = {}
    for debias in (True, False):
        means, p90 = [], []
        for n in sizes:
            errs = []
            for trial in range(n_trials):
                r = np.random.default_rng(1000 + trial)
                ii = r.choice(len(pool_imgs), min(n, len(pool_imgs)), replace=False)
                e = estimate_lot(cg, list(ii), QUALITY_WEIGHTS, lot_units,
                                 use_debias=debias, seed=trial)
                errs.append(abs(e.lqi - true_lqi))
            means.append(np.mean(errs)); p90.append(np.percentile(errs, 90))
        curves["de-biased" if debias else "raw counts"] = (means, p90)
        log(f"{'de-biased' if debias else 'raw counts':<11} MAE @ n=40: "
            f"{means[sizes.index(40)]:.4f}")

    fig, ax = plt.subplots(figsize=(6.2, 3.8))
    for (lab, (m, p)), col in zip(curves.items(), [C_MAIN, C_ACC]):
        ax.plot(sizes, m, "o-", color=col, label=f"{lab} (mean)")
        ax.fill_between(sizes, 0, p, color=col, alpha=0.10)
    ax.set_xlabel("sample size n (units graded)")
    ax.set_ylabel("|LQI error|")
    ax.set_title("Stage B: how many units must a trader actually check?")
    ax.legend(); fig.tight_layout()
    fig.savefig(OUT / "sample_size_study.png"); plt.close(fig)

    db = np.mean(curves["de-biased"][0]); rw = np.mean(curves["raw counts"][0])
    verdict = ("reduces mean |LQI error| by "
               f"{(rw-db)/rw:.1%} averaged over n" if db < rw else
               "does NOT beat raw counts here -- the grader is already well calibrated "
               "on synthetic data, so there is little bias to correct. Re-run this "
               "comparison on your real, messier field data before dropping it.")
    log(f"de-bias verdict: {verdict}")
    return est, true_lqi, true_mix, sizes, curves, verdict


# ---------------------------------------------------------------- STAGE C
def stage_c(est):
    print("\n[STAGE C] Prices, forecast, routing")
    prices = synthetic_prices()
    cpi = synthetic_cpi(prices)
    ser = prices[(prices.commodity == COMMODITY) & (prices.market == MARKET)].copy()
    ref = prices[(prices.commodity == COMMODITY) &
                 (prices.market == "Azadpur (Delhi)")].copy()
    log(f"{len(ser)} daily records for {COMMODITY} @ {MARKET}")

    real = fc.deflate(ser, cpi)
    spot = float(ser["modal_price"].iloc[-1])
    log(f"spot modal price: Rs {spot:,.0f}/qtl")

    res, frame = fc.rolling_backtest(ser, horizon=HORIZON,
                                     n_folds=3 if FAST else 6, reference=ref)
    for k, v in res.items():
        log(f"{k:<7} MAE {v['MAE']:8.1f}  MAPE {v['MAPE_%']:5.1f}%  "
            f"MASE {v['MASE']:.3f}  DirAcc {v['DirAcc']:.2f}")
    best = min(res, key=lambda k: res[k]["MAE"])
    log(f"best model: {best}")

    point, _insample = fc.fit_final_and_forecast(ser, HORIZON, ref)
    # honest sigma: out-of-sample backtest error of the best model, NOT the
    # in-sample residual (which is optimistically small on a boosted model)
    sigma = float(np.std(frame["actual"] - frame[best]))
    log(f"{HORIZON}-day forecast: Rs {point:,.0f}/qtl  (sigma {sigma:,.0f} oos)")

    # price history plot
    fig, (a1, a2) = plt.subplots(2, 1, figsize=(9, 5.4), sharex=False)
    tail = ser.tail(730)
    a1.plot(tail["date"], tail["modal_price"], color=C_MAIN, lw=1.0, label="nominal")
    a1.plot(real.tail(730)["date"], real.tail(730)["real_price"],
            color=C_ACC, lw=1.0, alpha=.8, label="real (CPI-deflated)")
    a1.set_title(f"{COMMODITY} @ {MARKET} -- modal price, last 2 years")
    a1.set_ylabel("Rs / quintal"); a1.legend(fontsize=8)

    f2 = frame.tail(220)
    a2.plot(f2["date"], f2["actual"], color="black", lw=1.2, label="actual")
    a2.plot(f2["date"], f2["naive"], color="grey", lw=0.9, ls="--", label="naive")
    a2.plot(f2["date"], f2["gbm"], color=C_ACC, lw=1.1, label="GBM")
    a2.set_title(f"Rolling-origin backtest, {HORIZON}-day horizon")
    a2.set_ylabel("Rs / quintal"); a2.legend(fontsize=8)
    fig.tight_layout(); fig.savefig(OUT / "price_backtest.png"); plt.close(fig)

    # ---- routing at the point estimate
    lqi = est.lqi
    ranked = rt.rank_channels(point, lqi, LOT_QUINTALS, COMMODITY)
    log(f"best channel @ LQI {lqi:.3f}: {ranked[0]['channel']} "
        f"(Rs {ranked[0]['net_rs']:,.0f})")

    plan = rt.route_with_capacity(point, lqi, LOT_QUINTALS, COMMODITY)
    decision = rt.sell_now_or_wait(spot, point, sigma, lqi, LOT_QUINTALS,
                                   COMMODITY, HORIZON)
    log(f"sell/wait: {decision['recommendation']} "
        f"(edge Rs {decision['edge_rs']:,.0f})")

    # ---- propagate LQI uncertainty into a revenue interval
    draws = np.random.default_rng(0).choice(est.lqi_draws, 150 if FAST else 600)
    rev = np.array([rt.rank_channels(point, float(q), LOT_QUINTALS, COMMODITY)[0]["net_rs"]
                    for q in draws])
    rev_lo, rev_hi = np.percentile(rev, [5, 95])
    log(f"revenue 90% CI: Rs {rev_lo:,.0f} - {rev_hi:,.0f}")

    # ---- how the recommended channel flips with quality
    grid = np.linspace(0.05, 1.0, 40)
    curves = {c.name: [] for c in rt.CHANNELS}
    for q in grid:
        for row in rt.rank_channels(point, float(q), LOT_QUINTALS, COMMODITY):
            curves[row["channel"]].append(row["net_rs"])

    fig, ax = plt.subplots(figsize=(6.6, 3.9))
    for (name, ys), col in zip(curves.items(),
                               ["#8c8c8c", C_MAIN, "#3b6ec1", C_ACC]):
        ax.plot(grid, np.array(ys) / 1000, lw=1.6, color=col, label=name)
    ax.axvline(lqi, color="black", ls=":", lw=1)
    ax.axvspan(*est.interval(0.90), color="black", alpha=0.07)
    ax.annotate(f"this lot\nLQI={lqi:.2f}", (lqi, ax.get_ylim()[1] * 0.12),
                fontsize=8, ha="center")
    ax.set_xlabel("Lot Quality Index"); ax.set_ylabel("net revenue (Rs '000)")
    ax.set_title(f"Optimal channel flips with quality -- {LOT_QUINTALS:.0f} qtl lot")
    ax.legend(fontsize=7.5); fig.tight_layout()
    fig.savefig(OUT / "price_history.png"); plt.close(fig)

    return dict(prices=ser, spot=spot, backtest=res, best_model=best,
                point=point, sigma=sigma, ranked=ranked, plan=plan,
                decision=decision, rev_ci=(rev_lo, rev_hi))


# ---------------------------------------------------------------- REPORT
def money(x):
    return f"₹{x:,.0f}"


def build_report(g, est, true_lqi, true_mix, c, debias_verdict):
    lo, hi = est.interval(0.90)
    d = c["decision"]
    rows_bt = "".join(
        f"<tr{' class=best' if k == c['best_model'] else ''}><td>{k}</td>"
        f"<td>{v['MAE']:.1f}</td><td>{v['RMSE']:.1f}</td><td>{v['MAPE_%']:.1f}%</td>"
        f"<td>{v['MASE']:.3f}</td>"
        f"<td>{'—' if k == 'naive' else format(v['DirAcc'], '.0%')}</td></tr>"
        for k, v in c["backtest"].items())

    rows_ch = "".join(
        f"<tr{' class=best' if i == 0 else ''}><td>{r['channel']}</td>"
        f"<td>{money(r['unit_gross_rs_qtl'])}</td>"
        f"<td>{r['spoilage_loss_qtl']:.1f}</td>"
        f"<td>{money(r['commission_rs'])}</td><td>{money(r['logistics_rs'])}</td>"
        f"<td><b>{money(r['net_rs'])}</b></td><td>{money(r['net_per_qtl'])}</td></tr>"
        for i, r in enumerate(c["ranked"]))

    rows_plan = "".join(
        f"<tr><td>{p['channel']}</td><td>{p['allocated_qtl']:.1f} qtl</td>"
        f"<td>{money(p['net_rs'])}</td></tr>" for p in c["plan"])
    plan_total = sum(p["net_rs"] for p in c["plan"])

    comp = est.composition
    rows_comp = "".join(
        f"<tr><td>{k}</td><td>{true_mix.get(k,0):.1%}</td><td>{comp.get(k,0):.1%}</td>"
        f"<td>{QUALITY_WEIGHTS[k]:.2f}</td></tr>" for k in CONDITIONS)

    gs = est.grade_split()
    rec_col = "#2f6f4e" if d["recommendation"] == "SELL NOW" else "#b8860b"

    html = f"""<!doctype html><html><head><meta charset="utf-8">
<title>VegGrade-Price — Lot Report</title><style>
*{{box-sizing:border-box}}
body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
margin:0;background:#f5f5f2;color:#1c1c1a}}
.wrap{{max-width:1080px;margin:0 auto;padding:32px 24px 80px}}
h1{{font-size:26px;margin:0 0 4px}} h2{{font-size:17px;margin:34px 0 12px;
padding-bottom:6px;border-bottom:2px solid #2f6f4e}}
.sub{{color:#6b6b66;font-size:13px;margin-bottom:24px}}
.cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}}
.card{{background:#fff;border:1px solid #e2e2dc;border-radius:8px;padding:14px 16px}}
.card .l{{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:#8a8a84}}
.card .v{{font-size:22px;font-weight:650;margin-top:4px}}
.card .n{{font-size:11px;color:#8a8a84;margin-top:3px}}
table{{width:100%;border-collapse:collapse;background:#fff;font-size:13px;
border:1px solid #e2e2dc;border-radius:8px;overflow:hidden}}
th{{background:#eceae4;text-align:left;padding:9px 11px;font-size:11px;
text-transform:uppercase;letter-spacing:.5px;color:#5a5a54}}
td{{padding:9px 11px;border-top:1px solid #efefe9}}
tr.best{{background:#eaf3ec}}
img{{width:100%;border:1px solid #e2e2dc;border-radius:8px;background:#fff;margin-top:8px}}
.rec{{background:{rec_col};color:#fff;padding:18px 22px;border-radius:8px;margin:14px 0}}
.rec .b{{font-size:24px;font-weight:700}}
.warn{{background:#fff6e0;border-left:4px solid #d9a441;padding:12px 16px;
font-size:12.5px;border-radius:0 6px 6px 0;margin:14px 0}}
code{{background:#eceae4;padding:1px 5px;border-radius:3px;font-size:12px}}
</style></head><body><div class="wrap">

<h1>VegGrade-Price — Lot Valuation Report</h1>
<div class="sub">{COMMODITY} · {MARKET} mandi · lot {LOT_QUINTALS:.0f} quintals
· {SAMPLE_N} units sampled · {HORIZON}-day horizon</div>

<div class="warn"><b>Synthetic demo.</b> Prices, images and channel economics are
procedurally generated stand-ins so the pipeline runs with zero downloads. The
architecture, interfaces and evaluation harness are real — swap in Agmarknet data
and your photo dataset at the two seams marked in the code.</div>

<h2>1 · Recommendation</h2>
<div class="rec"><div class="b">{d['recommendation']} → {c['ranked'][0]['channel']}</div>
<div style="margin-top:6px;font-size:14px">
Expected net {money(c['ranked'][0]['net_rs'])}
&nbsp;·&nbsp; 90% CI {money(c['rev_ci'][0])} – {money(c['rev_ci'][1])}
&nbsp;·&nbsp; edge over the alternative {money(abs(d['edge_rs']))}</div></div>

<div class="cards">
<div class="card"><div class="l">Lot Quality Index</div><div class="v">{est.lqi:.3f}</div>
<div class="n">90% CI {lo:.3f}–{hi:.3f} · truth {true_lqi:.3f}</div></div>
<div class="card"><div class="l">Spot modal price</div><div class="v">{money(c['spot'])}</div>
<div class="n">per quintal, today</div></div>
<div class="card"><div class="l">{HORIZON}-day forecast</div><div class="v">{money(c['point'])}</div>
<div class="n">σ ≈ {money(c['sigma'])} out-of-sample · best: {c['best_model']}</div></div>
<div class="card"><div class="l">Unsellable share</div>
<div class="v">{est.unsellable_fraction():.1%}</div>
<div class="n">rotten + infected</div></div>
</div>

<h2>2 · Stage A — grader</h2>
<p style="font-size:13px">Held-out accuracy <b>{g.test_acc_:.1%}</b> across
{len(g.classes_)} condition classes. The confusion matrix is not just a score —
Stage B inverts it to de-bias the sample counts.</p>
<img src="grader_confusion.png">

<h2>3 · Stage B — sample → lot inference</h2>
<table><tr><th>Condition</th><th>True share</th><th>Estimated</th><th>Weight w<sub>c</sub></th></tr>
{rows_comp}</table>
<p style="font-size:13px;margin-top:14px">Grade split →
<b>A {gs['A']:.0%}</b> · <b>B {gs['B']:.0%}</b> · <b>C {gs['C']:.0%}</b>.
The curve below answers the question a trader actually asks: <i>how many units do
I have to check?</i> Error falls roughly as 1/√n, and flattens once n is large
relative to the lot — that flattening point is your recommended sampling protocol.</p>
<div class="warn"><b>Confusion de-biasing:</b> {debias_verdict}</div>
<img src="sample_size_study.png">

<h2>4 · Stage C1 — price forecast, rolling-origin backtest</h2>
<table><tr><th>Model</th><th>MAE</th><th>RMSE</th><th>MAPE</th><th>MASE</th><th>Dir. acc</th></tr>
{rows_bt}</table>
<p style="font-size:12.5px;color:#6b6b66;margin-top:10px">MASE &lt; 1 means the model
beats the naive <code>ŷ = y<sub>t</sub></code> baseline. If your real-data MASE lands
near or above 1, report it honestly — the project's contribution is quality-conditioned
routing, not beating the market.</p>
<img src="price_backtest.png">

<h2>5 · Stage C2 — channel economics</h2>
<table><tr><th>Channel</th><th>Gross ₹/qtl</th><th>Spoilage (qtl)</th><th>Commission</th>
<th>Logistics</th><th>Net</th><th>Net ₹/qtl</th></tr>{rows_ch}</table>

<p style="font-size:13px;margin-top:16px"><b>Capacity-aware split.</b> The top channel
usually cannot absorb the whole lot, so allocate greedily by net rate:</p>
<table><tr><th>Channel</th><th>Allocated</th><th>Net</th></tr>{rows_plan}
<tr class="best"><td><b>Total</b></td><td><b>{LOT_QUINTALS:.0f} qtl</b></td>
<td><b>{money(plan_total)}</b></td></tr></table>
<p style="font-size:13px;margin-top:8px">Splitting beats single-channel by
<b>{money(plan_total - c['ranked'][0]['net_rs'])}</b> on this lot.</p>

<img src="price_history.png">
<p style="font-size:12.5px;color:#6b6b66">The crossings in that chart are the whole
point of the system: below a quality threshold, the high-margin channels stop being
optimal because spoilage over their longer time-to-sale eats the premium.</p>

<h2>6 · Sell now vs wait {HORIZON} days</h2>
<table>
<tr><td>Net if sold today</td><td><b>{money(d['net_if_sell_now'])}</b></td></tr>
<tr><td>Net if held (expected)</td><td>{money(d['net_if_wait_expected'])}</td></tr>
<tr><td>Net if held (risk-adjusted)</td><td>{money(d['net_if_wait_risk_adjusted'])}</td></tr>
<tr><td>Spoilage over the wait</td><td>{d['spoilage_loss_qtl']:.1f} qtl</td></tr>
<tr><td>LQI after waiting</td><td>{d['lqi_after_wait']:.3f}</td></tr>
<tr class="best"><td><b>Decision</b></td><td><b>{d['recommendation']}</b></td></tr>
</table>

<h2>7 · Next steps</h2>
<ol style="font-size:13px;line-height:1.75">
<li>Start the daily Agmarknet cron <b>this week</b> — the API serves current-day only.</li>
<li>Replace the RandomForest with a fine-tuned MobileNetV3; keep <code>predict_proba</code>.</li>
<li>Re-derive <code>QUALITY_WEIGHTS</code> and the channel table from grade-price
spreads and trader interviews. Do not ship the placeholders.</li>
<li>Collect field images at Ghaziabad/Hapur mandi and report field-only accuracy separately.</li>
<li>Validate against realised sale prices on ~10 real lots. That experiment carries the defense.</li>
</ol>
</div></body></html>"""
    (OUT / "report.html").write_text(html, encoding="utf-8")


def main():
    if FAST:
        print("\n*** FAST MODE: fewer images/trials/folds. Good for iterating,")
        print("*** but use the full run (no --fast) for anything you report.")
    g = stage_a()
    est, true_lqi, true_mix, sizes, curves, verdict = stage_b(g)
    c = stage_c(est)
    build_report(g, est, true_lqi, true_mix, c, verdict)

    summary = {
        "grader_accuracy": g.test_acc_,
        "lqi_estimate": est.lqi,
        "lqi_ci90": est.interval(0.90),
        "lqi_true": true_lqi,
        "spot_price": c["spot"],
        "forecast": c["point"],
        "backtest": c["backtest"],
        "best_channel": c["ranked"][0]["channel"],
        "expected_net": c["ranked"][0]["net_rs"],
        "decision": c["decision"]["recommendation"],
    }
    (OUT / "summary.json").write_text(json.dumps(summary, indent=2, default=float), encoding="utf-8")
    print(f"\nDone -> {OUT/'report.html'}")
    print("Open that file in your web browser to see the report.")


if __name__ == "__main__":
    main()
