#!/usr/bin/env python3
"""Iteracion de punto fijo x_{k+1}=g(x_k)."""

from __future__ import annotations

import argparse
import math
from typing import Callable, List, Tuple

from utils_numericos import estimar_orden_desde_errores, evaluar_expresion


def punto_fijo(
    g: Callable[[float], float],
    x0: float,
    tol: float,
    max_iter: int,
    lipschitz: float | None,
) -> Tuple[float, int, float, List[Tuple[int, float, float, float | None, float | None]]]:
    x = x0
    errores: List[float] = []
    hist: List[Tuple[int, float, float, float | None, float | None]] = []

    for k in range(1, max_iter + 1):
        x_next = g(x)
        if not math.isfinite(x_next):
            raise ValueError("La iteracion produjo un valor no finito.")

        err = abs(x_next - x)
        errores.append(err)
        orden = estimar_orden_desde_errores(errores)

        cota = None
        if lipschitz is not None and 0.0 < lipschitz < 1.0:
            cota = (lipschitz / (1.0 - lipschitz)) * err

        hist.append((k, x_next, err, orden, cota))
        if err <= tol:
            return x_next, k, err, hist
        x = x_next

    return x, max_iter, errores[-1] if errores else float("inf"), hist


def main() -> None:
    parser = argparse.ArgumentParser(description="Metodo de punto fijo para resolver x = g(x).")
    parser.add_argument("--g", required=True, help="Expresion de g(x), ej: cos(x)")
    parser.add_argument("--x0", type=float, required=True, help="Valor inicial")
    parser.add_argument("--tol", type=float, default=1e-8, help="Tolerancia")
    parser.add_argument("--max-iter", type=int, default=200, help="Maximo de iteraciones")
    parser.add_argument(
        "--lipschitz",
        type=float,
        default=None,
        help="Constante L de contraccion (opcional, 0<L<1) para cotas de error",
    )
    parser.add_argument("--mostrar-historial", action="store_true", help="Muestra iteraciones")
    args = parser.parse_args()

    g = lambda x: evaluar_expresion(args.g, {"x": x})
    x_aprox, iters, err_final, hist = punto_fijo(
        g=g,
        x0=args.x0,
        tol=args.tol,
        max_iter=args.max_iter,
        lipschitz=args.lipschitz,
    )

    print("metodo=punto_fijo")
    print(f"x_aprox={x_aprox:.12g}")
    print(f"iteraciones={iters}")
    print(f"error_final={err_final:.12g}")

    if args.lipschitz is not None:
        if 0.0 < args.lipschitz < 1.0:
            print(f"lipschitz={args.lipschitz:.12g} (contraccion valida)")
        else:
            print(f"lipschitz={args.lipschitz:.12g} (fuera de rango de contraccion)")

    if hist and hist[-1][3] is not None:
        print(f"orden_estimado={hist[-1][3]:.6g}")

    if args.mostrar_historial:
        print("\niter,x_k,error_iter,orden_estimado,cota_aposteriori")
        for k, xk, err, orden, cota in hist:
            ord_s = "" if orden is None else f"{orden:.12g}"
            cota_s = "" if cota is None else f"{cota:.12g}"
            print(f"{k},{xk:.12g},{err:.12g},{ord_s},{cota_s}")


if __name__ == "__main__":
    main()

