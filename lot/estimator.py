"""
STAGE B -- sample -> lot inference. The intellectual core of the project.

Given n graded sample units drawn from a lot of M units, produce a posterior
over the lot's true condition proportions, and hence over the Lot Quality
Index (LQI), WITH a credible interval.

Two things done here that most student projects omit:
  1. de-biasing observed counts using the grader's confusion matrix
  2. reporting a credible interval rather than a point estimate
"""
from __future__ import annotations

import numpy as np


def debias_counts(obs_counts: np.ndarray, cm: np.ndarray, ridge=1e-3) -> np.ndarray:
    """Invert classifier bias.

    Observed count vector o ~ M^T t, where M[i,j] = P(pred=j | true=i) and t is
    the true count vector. Solve for t by constrained least squares, then clip
    negatives and rescale to preserve the sample size.
    """
    A = cm.T                                   # A[j,i] = P(pred=j | true=i)
    n = obs_counts.sum()
    if n == 0:
        return obs_counts.astype(float)
    reg = A.T @ A + ridge * np.eye(A.shape[1])
    t = np.linalg.solve(reg, A.T @ obs_counts)
    t = np.clip(t, 0, None)
    if t.sum() <= 0:
        return obs_counts.astype(float)
    return t * (n / t.sum())


def lot_posterior(
    counts: np.ndarray,
    n_draws=4000,
    alpha0=0.5,
    seed=0,
) -> np.ndarray:
    """Dirichlet posterior draws over lot class proportions. Returns (n_draws, K)."""
    rng = np.random.default_rng(seed)
    alpha = alpha0 + np.asarray(counts, float)
    return rng.dirichlet(alpha, size=n_draws)


def lqi_from_theta(theta: np.ndarray, weights: np.ndarray) -> np.ndarray:
    """LQI = sum_c theta_c * w_c. Works on a single theta or a stack of draws."""
    return np.asarray(theta) @ np.asarray(weights)


def finite_population_correction(n: int, M: int) -> float:
    """Sampling from a finite lot is more informative than from an infinite one."""
    if M <= 1 or n >= M:
        return 0.0
    return float(np.sqrt((M - n) / (M - 1)))


class LotEstimate:
    def __init__(self, classes, weights, lqi_draws, theta_draws, n_sampled, lot_units):
        self.classes = list(classes)
        self.weights = np.asarray(weights)
        self.lqi_draws = lqi_draws
        self.theta_draws = theta_draws
        self.n_sampled = n_sampled
        self.lot_units = lot_units

    @property
    def lqi(self) -> float:
        return float(self.lqi_draws.mean())

    def interval(self, level=0.90) -> tuple[float, float]:
        lo, hi = (1 - level) / 2 * 100, (1 + level) / 2 * 100
        return tuple(np.percentile(self.lqi_draws, [lo, hi]).round(4))

    @property
    def composition(self) -> dict:
        m = self.theta_draws.mean(axis=0)
        return {c: float(v) for c, v in zip(self.classes, m)}

    def unsellable_fraction(self) -> float:
        """Share of the lot that realistically cannot be sold at any channel."""
        idx = [i for i, c in enumerate(self.classes) if c in ("rotten", "infected")]
        return float(self.theta_draws[:, idx].sum(axis=1).mean()) if idx else 0.0

    def grade_split(self) -> dict:
        """Split the lot into A/B/C grades -- enables multi-channel routing."""
        comp = self.composition
        a = comp.get("fresh", 0) + comp.get("ripe", 0)
        b = comp.get("unripe", 0) + comp.get("bruised", 0)
        c = comp.get("pest_damaged", 0) + comp.get("infected", 0) + comp.get("rotten", 0)
        return {"A": a, "B": b, "C": c}


def estimate_lot(
    grader,
    sample_images,
    weights_map: dict,
    lot_units: int,
    use_debias=True,
    seed=0,
) -> LotEstimate:
    """Full Stage B: grade the sample -> de-bias -> posterior -> LQI."""
    proba = grader.predict_proba(sample_images)          # (n, K)
    classes = grader.classes_
    # soft counts preserve more information than argmax hard labels
    obs = proba.sum(axis=0)

    if use_debias and grader.confusion_matrix_normalised() is not None:
        counts = debias_counts(obs, grader.confusion_matrix_normalised())
    else:
        counts = obs

    # finite-population correction: shrink uncertainty when the sample covers
    # a large share of the lot, by inflating the effective observation count
    fpc = finite_population_correction(len(sample_images), lot_units)
    eff = counts / max(fpc**2, 1e-3) if fpc > 0 else counts * 50

    theta = lot_posterior(eff, seed=seed)
    w = np.array([weights_map[c] for c in classes])
    return LotEstimate(classes, w, lqi_from_theta(theta, w), theta,
                       len(sample_images), lot_units)
