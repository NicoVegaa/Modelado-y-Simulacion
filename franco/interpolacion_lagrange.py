#!/usr/bin/env python3
"""Interpolacion de Lagrange para reconstruccion desde datos discretos."""

from __future__ import annotations

import argparse
from typing import List

from utils_numericos import evaluar_expresion, parse_float_list


def validar_nodos_distintos(xn: List[float]) -> None:
    if len(set(xn)) != len(xn):
        raise ValueError("Los nodos x deben ser todos distintos.")


def lagrange_eval(xn: List[float], yn: List[float], x: float) -> float:
    n = len(xn)
    total = 0.0
    for i in range(n):
        li = 1.0
        xi = xn[i]
        for j in range(n):
            if i == j:
                continue
            li *= (x - xn[j]) / (xi - xn[j])
        total += yn[i] * li
    return total


def main() -> None:
    parser = argparse.ArgumentParser(description="Interpolacion polinomica de Lagrange.")
    parser.add_argument("--x", required=True, help="Nodos x, ej: 0,1,2")
    parser.add_argument("--y", required=True, help="Valores y=f(x), ej: 1,3,2")
    parser.add_argument(
        "--x-eval",
        required=True,
        help="Puntos donde evaluar el polinomio, ej: 0.5,1.5",
    )
    parser.add_argument(
        "--f-real",
        default=None,
        help="Funcion real f(x) opcional para comparar error, ej: sin(x)",
    )
    args = parser.parse_args()

    xn = parse_float_list(args.x)
    yn = parse_float_list(args.y)
    x_eval = parse_float_list(args.x_eval)
    if len(xn) != len(yn):
        raise ValueError("Las listas --x y --y deben tener el mismo largo.")
    if len(xn) < 2:
        raise ValueError("Se requieren al menos 2 nodos para interpolar.")
    validar_nodos_distintos(xn)

    print("metodo=interpolacion_lagrange")
    print(f"grado_polinomio={len(xn) - 1}")
    print("\nx,p_lagrange(x),f_real(x),error_abs")

    errores: List[float] = []
    for x in x_eval:
        p = lagrange_eval(xn, yn, x)
        if args.f_real:
            f_true = evaluar_expresion(args.f_real, {"x": x})
            err = abs(f_true - p)
            errores.append(err)
            print(f"{x:.12g},{p:.12g},{f_true:.12g},{err:.12g}")
        else:
            print(f"{x:.12g},{p:.12g},,")

    if errores:
        print(f"\nerror_max={max(errores):.12g}")


if __name__ == "__main__":
    main()

