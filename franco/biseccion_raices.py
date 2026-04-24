#!/usr/bin/env python3
"""Busqueda binaria (biseccion) para raices de f(x)=0."""

from __future__ import annotations

import argparse
from typing import Callable, List, Tuple

from utils_numericos import evaluar_expresion


def biseccion(
    f: Callable[[float], float],
    a: float,
    b: float,
    tol: float,
    max_iter: int,
) -> Tuple[float, float, int, float, List[Tuple[int, float, float, float, float, float]]]:
    fa = f(a)
    fb = f(b)
    if fa == 0.0:
        return a, fa, 0, 0.0, []
    if fb == 0.0:
        return b, fb, 0, 0.0, []
    if fa * fb > 0:
        raise ValueError("f(a) y f(b) deben tener signos opuestos.")

    hist: List[Tuple[int, float, float, float, float, float]] = []
    c = a
    fc = fa
    for k in range(1, max_iter + 1):
        c = 0.5 * (a + b)
        fc = f(c)
        cota_error = abs(b - a) * 0.5
        hist.append((k, a, b, c, fc, cota_error))
        if abs(fc) <= tol or cota_error <= tol:
            return c, fc, k, cota_error, hist
        if fa * fc < 0:
            b, fb = c, fc
        else:
            a, fa = c, fc

    return c, fc, max_iter, abs(b - a) * 0.5, hist


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Metodo de biseccion para hallar una raiz de f(x)=0 en [a,b]."
    )
    parser.add_argument("--f", required=True, help="Expresion de f en funcion de x, ej: x**3-x-2")
    parser.add_argument("--a", type=float, required=True, help="Extremo izquierdo")
    parser.add_argument("--b", type=float, required=True, help="Extremo derecho")
    parser.add_argument("--tol", type=float, default=1e-8, help="Tolerancia de parada")
    parser.add_argument("--max-iter", type=int, default=200, help="Maximo de iteraciones")
    parser.add_argument(
        "--mostrar-historial",
        action="store_true",
        help="Muestra todas las iteraciones",
    )
    args = parser.parse_args()

    f = lambda x: evaluar_expresion(args.f, {"x": x})
    raiz, f_raiz, iters, cota_error, hist = biseccion(f, args.a, args.b, args.tol, args.max_iter)

    print(f"metodo=biseccion")
    print(f"raiz_aprox={raiz:.12g}")
    print(f"f(raiz_aprox)={f_raiz:.12g}")
    print(f"iteraciones={iters}")
    print(f"cota_error={cota_error:.12g}")
    print("orden_teorico=1 (convergencia lineal), razon_asintotica~1/2")

    if args.mostrar_historial:
        print("\niter,a,b,c,f(c),cota_error")
        for k, a, b, c, fc, e in hist:
            print(f"{k},{a:.12g},{b:.12g},{c:.12g},{fc:.12g},{e:.12g}")


if __name__ == "__main__":
    main()

