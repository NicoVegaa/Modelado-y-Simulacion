#!/usr/bin/env python3
"""Metodo de Newton-Raphson para raices de f(x)=0."""

from __future__ import annotations

import argparse
import math
from typing import Callable, List, Tuple

from utils_numericos import estimar_orden_desde_errores, evaluar_expresion


def derivada_numerica(f: Callable[[float], float], x: float, h_base: float) -> float:
    h = h_base * max(1.0, abs(x))
    return (f(x + h) - f(x - h)) / (2.0 * h)


def newton(
    f: Callable[[float], float],
    df: Callable[[float], float],
    x0: float,
    tol: float,
    max_iter: int,
    multiplicidad: int,
) -> Tuple[float, int, float, List[Tuple[int, float, float, float, float | None]]]:
    x = x0
    errores: List[float] = []
    hist: List[Tuple[int, float, float, float, float | None]] = []

    for k in range(1, max_iter + 1):
        fx = f(x)
        dfx = df(x)
        if abs(dfx) < 1e-15:
            raise ValueError(f"Derivada casi nula en iteracion {k}, x={x}.")

        x_next = x - multiplicidad * fx / dfx
        if not math.isfinite(x_next):
            raise ValueError("La iteracion produjo un valor no finito.")

        err = abs(x_next - x)
        errores.append(err)
        orden = estimar_orden_desde_errores(errores)
        hist.append((k, x_next, f(x_next), err, orden))

        if err <= tol or abs(f(x_next)) <= tol:
            return x_next, k, err, hist
        x = x_next

    return x, max_iter, errores[-1] if errores else float("inf"), hist


def main() -> None:
    parser = argparse.ArgumentParser(description="Newton-Raphson para f(x)=0.")
    parser.add_argument("--f", required=True, help="Expresion de f(x)")
    parser.add_argument("--df", default=None, help="Expresion de f'(x). Si se omite, se aproxima numericamente")
    parser.add_argument("--x0", type=float, required=True, help="Valor inicial")
    parser.add_argument("--tol", type=float, default=1e-10, help="Tolerancia")
    parser.add_argument("--max-iter", type=int, default=100, help="Maximo de iteraciones")
    parser.add_argument("--h", type=float, default=1e-6, help="Paso base para derivada numerica")
    parser.add_argument(
        "--multiplicidad",
        type=int,
        default=1,
        help="Usa m>1 para Newton modificado si la raiz tiene multiplicidad m",
    )
    parser.add_argument("--mostrar-historial", action="store_true", help="Muestra iteraciones")
    args = parser.parse_args()

    if args.multiplicidad <= 0:
        raise ValueError("--multiplicidad debe ser un entero positivo.")

    f = lambda x: evaluar_expresion(args.f, {"x": x})
    if args.df:
        df = lambda x: evaluar_expresion(args.df, {"x": x})
    else:
        df = lambda x: derivada_numerica(f, x, args.h)

    x_aprox, iters, err_final, hist = newton(
        f=f,
        df=df,
        x0=args.x0,
        tol=args.tol,
        max_iter=args.max_iter,
        multiplicidad=args.multiplicidad,
    )

    print("metodo=newton_raphson")
    print(f"x_aprox={x_aprox:.12g}")
    print(f"f(x_aprox)={f(x_aprox):.12g}")
    print(f"iteraciones={iters}")
    print(f"error_final={err_final:.12g}")
    if args.df:
        print("derivada=analitica")
    else:
        print("derivada=numerica (diferencia central)")
    if hist and hist[-1][4] is not None:
        print(f"orden_estimado={hist[-1][4]:.6g}")
    if args.multiplicidad > 1:
        print("nota=se uso Newton modificado para acelerar raices multiples")

    if args.mostrar_historial:
        print("\niter,x_k,f(x_k),error_iter,orden_estimado")
        for k, xk, fxk, err, orden in hist:
            ord_s = "" if orden is None else f"{orden:.12g}"
            print(f"{k},{xk:.12g},{fxk:.12g},{err:.12g},{ord_s}")


if __name__ == "__main__":
    main()

