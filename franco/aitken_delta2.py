#!/usr/bin/env python3
"""Aceleracion de convergencia lineal con Aitken Delta^2."""

from __future__ import annotations

import argparse
import math
from typing import Callable, List, Tuple

from utils_numericos import evaluar_expresion, parse_float_list


def generar_secuencia(g: Callable[[float], float], x0: float, n: int) -> List[float]:
    seq = [x0]
    x = x0
    for _ in range(n):
        x = g(x)
        if not math.isfinite(x):
            raise ValueError("La iteracion produjo un valor no finito.")
        seq.append(x)
    return seq


def aitken_delta2(seq: List[float]) -> List[Tuple[int, float, float, float, float | None]]:
    if len(seq) < 3:
        raise ValueError("Se necesitan al menos 3 terminos para aplicar Aitken.")

    out: List[Tuple[int, float, float, float, float | None]] = []
    for k in range(len(seq) - 2):
        x0, x1, x2 = seq[k], seq[k + 1], seq[k + 2]
        d1 = x1 - x0
        d2 = x2 - x1
        denom = d2 - d1
        if abs(denom) < 1e-15:
            x_hat = None
        else:
            x_hat = x0 - (d1 * d1) / denom
        out.append((k, x0, x1, x2, x_hat))
    return out


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Aitken Delta^2 para acelerar una sucesion convergente."
    )
    parser.add_argument(
        "--seq",
        default=None,
        help="Secuencia separada por comas, ej: 1,0.5,0.333,0.25",
    )
    parser.add_argument(
        "--g",
        default=None,
        help="Si no pasas --seq, puedes generar secuencia con x_{k+1}=g(x_k)",
    )
    parser.add_argument("--x0", type=float, default=None, help="Semilla para generar secuencia")
    parser.add_argument(
        "--n",
        type=int,
        default=8,
        help="Cantidad de iteraciones para generar secuencia con --g",
    )
    parser.add_argument(
        "--x-star",
        type=float,
        default=None,
        help="Valor real de referencia para comparar errores (opcional)",
    )
    args = parser.parse_args()

    if args.seq is None and args.g is None:
        raise ValueError("Debes pasar --seq o bien --g (con --x0).")

    if args.seq is not None:
        seq = parse_float_list(args.seq)
    else:
        if args.x0 is None:
            raise ValueError("Con --g debes informar --x0.")
        g = lambda x: evaluar_expresion(args.g, {"x": x})
        seq = generar_secuencia(g, args.x0, args.n)

    tabla = aitken_delta2(seq)

    print("metodo=aitken_delta2")
    print(f"terminos_originales={len(seq)}")
    print("\nk,x_k,x_k1,x_k2,x_aitken")
    for k, xk, xk1, xk2, xhat in tabla:
        xhat_s = "" if xhat is None else f"{xhat:.12g}"
        print(f"{k},{xk:.12g},{xk1:.12g},{xk2:.12g},{xhat_s}")

    ult = next((row[4] for row in reversed(tabla) if row[4] is not None), None)
    if ult is not None:
        print(f"\nultimo_aitken={ult:.12g}")

    if args.x_star is not None and ult is not None:
        err_orig = abs(seq[-1] - args.x_star)
        err_aitken = abs(ult - args.x_star)
        factor = err_orig / err_aitken if err_aitken > 0 else float("inf")
        print(f"error_original={err_orig:.12g}")
        print(f"error_aitken={err_aitken:.12g}")
        print(f"mejora_aprox={factor:.12g}x")


if __name__ == "__main__":
    main()

