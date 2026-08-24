"""
STAGE C1 -- price forecasting with an honest evaluation harness.

Key discipline enforced here:
  * naive and seasonal-naive baselines are ALWAYS computed
  * rolling-origin (expanding window) backtest, never a random split
  * MASE reported against the naive baseline -- MASE < 1 means you added value
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.linear_model import Ridge

LAGS = [1, 2, 3, 5, 7, 14, 21, 30]
ROLLS = [7, 14, 30]


def build_features(df: pd.DataFrame, horizon=7, reference: pd.DataFrame | None = None):
    """df: one (commodity, market) series with columns [date, modal_price, arrivals]."""
    d = df.sort_values("date").reset_index(drop=True).copy()
    y = d["modal_price"]

    for L in LAGS:
        d[f"lag_{L}"] = y.shift(L)
    for R in ROLLS:
        d[f"roll_mean_{R}"] = y.shift(1).rolling(R).mean()
        d[f"roll_std_{R}"] = y.shift(1).rolling(R).std()
        d[f"roll_min_{R}"] = y.shift(1).rolling(R).min()
        d[f"roll_max_{R}"] = y.shift(1).rolling(R).max()
    d["mom_7"] = y.shift(1) / y.shift(8) - 1
    d["mom_30"] = y.shift(1) / y.shift(31) - 1
    if "arrivals" in d:
        d["arr_lag1"] = d["arrivals"].shift(1)
        d["arr_roll7"] = d["arrivals"].shift(1).rolling(7).mean()

    doy = d["date"].dt.dayofyear
    d["dow"] = d["date"].dt.dayofweek
    d["month"] = d["date"].dt.month
    for k in (1, 2, 3):
        d[f"sin_{k}"] = np.sin(2 * np.pi * k * doy / 365.25)
        d[f"cos_{k}"] = np.cos(2 * np.pi * k * doy / 365.25)

    # exogenous benchmark series (Azadpur drives North India price discovery)
    if reference is not None:
        ref = reference[["date", "modal_price"]].rename(columns={"modal_price": "ref"})
        d = d.merge(ref, on="date", how="left")
        d["ref_lag1"] = d["ref"].shift(1)
        d["ref_ratio"] = d["modal_price"].shift(1) / d["ref"].shift(1)
        d = d.drop(columns=["ref"])

    d["target"] = y.shift(-horizon)
    feat_cols = [c for c in d.columns
                 if c not in ("date", "commodity", "market", "modal_price",
                              "min_price", "max_price", "arrivals", "target")]
    return d, feat_cols


def mase(y_true, y_pred, y_naive):
    denom = np.mean(np.abs(y_true - y_naive))
    return float(np.mean(np.abs(y_true - y_pred)) / denom) if denom > 0 else np.nan


def metrics(y_true, y_pred, y_naive):
    y_true, y_pred = np.asarray(y_true), np.asarray(y_pred)
    err = y_true - y_pred
    return {
        "MAE": float(np.mean(np.abs(err))),
        "RMSE": float(np.sqrt(np.mean(err**2))),
        "MAPE_%": float(np.mean(np.abs(err / np.clip(y_true, 1e-6, None))) * 100),
        "MASE": mase(y_true, y_pred, y_naive),
    }


def directional_accuracy(y_true, y_pred, last_obs):
    """Did we get the up/down direction right? This is what drives sell/hold."""
    a = np.sign(np.asarray(y_true) - np.asarray(last_obs))
    b = np.sign(np.asarray(y_pred) - np.asarray(last_obs))
    return float((a == b).mean())


def rolling_backtest(df, horizon=7, n_folds=6, reference=None, seed=0):
    """Expanding-window backtest. Returns (results_dict, predictions_frame)."""
    d, cols = build_features(df, horizon, reference)
    d = d.dropna(subset=cols + ["target"]).reset_index(drop=True)
    n = len(d)
    fold = n // (n_folds + 2)
    start = n - n_folds * fold

    out = {k: [] for k in ["naive", "snaive", "ridge", "gbm"]}
    truth, dates, last = [], [], []

    for f in range(n_folds):
        te0, te1 = start + f * fold, min(start + (f + 1) * fold, n)
        if te1 <= te0:
            continue
        tr, te = d.iloc[:te0], d.iloc[te0:te1]
        Xtr, ytr = tr[cols].to_numpy(), tr["target"].to_numpy()
        Xte, yte = te[cols].to_numpy(), te["target"].to_numpy()

        out["naive"].append(te["modal_price"].to_numpy())            # y_hat = y_t
        out["snaive"].append(te["lag_7"].to_numpy())                 # weekly seasonal

        r = Ridge(alpha=10.0).fit(np.nan_to_num(Xtr), ytr)
        out["ridge"].append(r.predict(np.nan_to_num(Xte)))

        g = HistGradientBoostingRegressor(
            max_iter=400, learning_rate=0.05, max_depth=6,
            min_samples_leaf=20, l2_regularization=1.0, random_state=seed
        ).fit(Xtr, ytr)
        out["gbm"].append(g.predict(Xte))

        truth.append(yte)
        dates.append(te["date"].to_numpy())
        last.append(te["modal_price"].to_numpy())

    truth = np.concatenate(truth)
    last = np.concatenate(last)
    preds = {k: np.concatenate(v) for k, v in out.items()}

    res = {}
    for k, p in preds.items():
        m = metrics(truth, p, preds["naive"])
        m["DirAcc"] = directional_accuracy(truth, p, last)
        res[k] = m

    frame = pd.DataFrame({"date": np.concatenate(dates), "actual": truth, **preds})
    return res, frame


def fit_final_and_forecast(df, horizon=7, reference=None, seed=0):
    """Train on all data, forecast `horizon` days ahead from the last observation.

    Returns (point_forecast, sigma). sigma comes from in-sample residual spread
    and feeds the price interval shown to the user.
    """
    d, cols = build_features(df, horizon, reference)
    train = d.dropna(subset=cols + ["target"])
    X, y = train[cols].to_numpy(), train["target"].to_numpy()
    g = HistGradientBoostingRegressor(
        max_iter=400, learning_rate=0.05, max_depth=6,
        min_samples_leaf=20, l2_regularization=1.0, random_state=seed
    ).fit(X, y)

    live = d.dropna(subset=cols).iloc[[-1]]
    point = float(g.predict(live[cols].to_numpy())[0])
    resid = y - g.predict(X)
    return point, float(np.std(resid))


def deflate(prices: pd.DataFrame, cpi: pd.DataFrame, base_index=None) -> pd.DataFrame:
    """Convert nominal Rs/quintal to real terms using a CPI series."""
    p = prices.copy()
    p["month"] = p["date"].values.astype("datetime64[M]")
    c = cpi.copy()
    c["month"] = c["month"].values.astype("datetime64[M]")
    p = p.merge(c, on="month", how="left")
    p["cpi"] = p["cpi"].ffill().bfill()
    base = base_index if base_index is not None else p["cpi"].iloc[-1]
    p["real_price"] = p["modal_price"] * base / p["cpi"]
    return p.drop(columns=["month"])
