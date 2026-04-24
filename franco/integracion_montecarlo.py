#!/usr/bin/env python3
"""Integracion Monte Carlo en compactos 1D o multidimensionales."""

from __future__ import annotations

import argparse
import math
import random
from statistics import NormalDist
from typing import Callable, List, Sequence, Tuple

from utils_numericos import evaluar_expresion, parse_bounds, producto


def construir_f(expr: str, dim: int) -> Callable[[Sequence[float]], float]:
    def _f(point: Sequence[float]) -> float:
        vars_map = {f"x{i+1}": point[i] for i in range(dim)}
        vars_map["x"] = point[0]
        return evaluar_expresion(expr, vars_map)

    return _f


def montecarlo_integral(
    f: Callable[[Sequence[float]], float],
    bounds: List[Tuple[float, float]],
    n: int,
    alpha: float,
    rng: random.Random,
) -> Tuple[float, float, float, Tuple[float, float]]:
    dim = len(bounds)
    volumen = producto(hi - lo for lo, hi in bounds)

    mean = 0.0
    m2 = 0.0
    for k in range(1, n + 1):
        point = [rng.uniform(bounds[i][0], bounds[i][1]) for i in range(dim)]
        val = f(point)
        delta = val - mean
        mean += delta / k
        m2 += delta * (val - mean)

    var_f = (m2 / (n - 1)) if n > 1 else 0.0
    integral_hat = volumen * mean
    var_estimador = (volumen * volumen) * var_f / n
    se = math.sqrt(max(var_estimador, 0.0))

    z = NormalDist().inv_cdf(1.0 - alpha / 2.0)
    ci = (integral_hat - z * se, integral_hat + z * se)
    return integral_hat, var_estimador, se, ci


def estimar_n_requerido(
    var_estimador_n: float,
    n: int,
    alpha: float,
    target_error: float,
) -> int:
    if target_error <= 0:
        raise ValueError("--target-error debe ser positivo.")
    if n <= 0:
        raise ValueError("n debe ser positivo.")
    # var_estimador_n = sigma^2 / n => sigma^2 = var_estimador_n * n
    sigma2 = var_estimador_n * n
    z = NormalDist().inv_cdf(1.0 - alpha / 2.0)
    n_req = math.ceil((z * math.sqrt(max(sigma2, 0.0)) / target_error) ** 2)
    return max(1, n_req)


def main() -> None:
    parser = argparse.ArgumentParser(description="Integracion Monte Carlo para regiones compactas.")
    parser.add_argument(
        "--f",
        required=True,
        help="Funcion. Variables: x (1D) o x1,x2,... para varias dimensiones",
    )
    parser.add_argument(
        "--bounds",
        required=True,
        help="Limites por dimension, ej 1D: '0,1' | 2D: '0,1; -1,2'",
    )
    parser.add_argument("--n", type=int, required=True, help="Cantidad de muestras")
    parser.add_argument("--alpha", type=float, default=0.05, help="Nivel de significancia para IC")
    parser.add_argument("--seed", type=int, default=None, help="Semilla aleatoria opcional")
    parser.add_argument(
        "--target-error",
        type=float,
        default=None,
        help="Si se informa, estima n recomendado para ese margen de error",
    )
    args = parser.parse_args()

    if args.n <= 0:
        raise ValueError("n debe ser positivo.")
    if not (0.0 < args.alpha < 1.0):
        raise ValueError("alpha debe estar entre 0 y 1.")

    bounds = parse_bounds(args.bounds)
    dim = len(bounds)
    f = construir_f(args.f, dim)
    rng = random.Random(args.seed)

    integral_hat, var_estimador, se, (ci_lo, ci_hi) = montecarlo_integral(
        f=f,
        bounds=bounds,
        n=args.n,
        alpha=args.alpha,
        rng=rng,
    )

    print("metodo=integracion_montecarlo")
    print(f"dim={dim}")
    print(f"n={args.n}")
    print(f"alpha={args.alpha:.12g}")
    if args.seed is not None:
        print(f"seed={args.seed}")
    print(f"integral_aprox={integral_hat:.12g}")
    print(f"var_estimador={var_estimador:.12g}")
    print(f"error_std={se:.12g}")
    print(f"ic_{100*(1-args.alpha):.1f}%=[{ci_lo:.12g}, {ci_hi:.12g}]")

    if args.target_error is not None:
        n_req = estimar_n_requerido(var_estimador, args.n, args.alpha, args.target_error)
        print(f"target_error={args.target_error:.12g}")
        print(f"n_recomendado={n_req}")


if __name__ == "__main__":
    main()

