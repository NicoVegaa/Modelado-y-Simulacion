#!/usr/bin/env python3
"""Integracion numerica: rectangulos, trapecio y Simpson."""

from __future__ import annotations

import argparse
import math
from typing import Callable

from utils_numericos import evaluar_expresion


def rectangulos(f: Callable[[float], float], a: float, b: float, n: int, regla: str) -> float:
    h = (b - a) / n
    if regla == "left":
        return h * sum(f(a + i * h) for i in range(n))
    if regla == "right":
        return h * sum(f(a + (i + 1) * h) for i in range(n))
    if regla == "midpoint":
        return h * sum(f(a + (i + 0.5) * h) for i in range(n))
    raise ValueError("Regla de rectangulos invalida.")


def trapecio(f: Callable[[float], float], a: float, b: float, n: int) -> float:
    h = (b - a) / n
    s = 0.5 * (f(a) + f(b))
    s += sum(f(a + i * h) for i in range(1, n))
    return h * s


def simpson(f: Callable[[float], float], a: float, b: float, n: int) -> float:
    if n % 2 != 0:
        raise ValueError("Para Simpson, n debe ser par.")
    h = (b - a) / n
    s = f(a) + f(b)
    s += 4.0 * sum(f(a + i * h) for i in range(1, n, 2))
    s += 2.0 * sum(f(a + i * h) for i in range(2, n, 2))
    return (h / 3.0) * s


def integrar(
    f: Callable[[float], float],
    metodo: str,
    a: float,
    b: float,
    n: int,
    regla: str,
) -> float:
    if metodo == "rectangulos":
        return rectangulos(f, a, b, n, regla)
    if metodo == "trapecio":
        return trapecio(f, a, b, n)
    if metodo == "simpson":
        return simpson(f, a, b, n)
    raise ValueError("Metodo no soportado.")


def orden_teorico(metodo: str, regla: str) -> int:
    if metodo == "rectangulos":
        if regla in {"left", "right"}:
            return 1
        return 2
    if metodo == "trapecio":
        return 2
    return 4


def estimar_error_richardson(
    f: Callable[[float], float],
    metodo: str,
    regla: str,
    a: float,
    b: float,
    n: int,
) -> tuple[float, float | None]:
    p = orden_teorico(metodo, regla)
    i_n = integrar(f, metodo, a, b, n, regla)
    i_2n = integrar(f, metodo, a, b, 2 * n, regla)
    err_est = abs(i_2n - i_n) / (2**p - 1)

    i_4n = integrar(f, metodo, a, b, 4 * n, regla)
    den = abs(i_2n - i_n)
    num = abs(i_4n - i_2n)
    p_obs = None
    if den > 0 and num > 0:
        p_obs = math.log(den / num, 2.0)
    return err_est, p_obs


def main() -> None:
    parser = argparse.ArgumentParser(description="Cuadraturas numericas en 1D.")
    parser.add_argument("--f", required=True, help="Expresion de f(x)")
    parser.add_argument("--a", type=float, required=True)
    parser.add_argument("--b", type=float, required=True)
    parser.add_argument("--n", type=int, required=True, help="Cantidad de subintervalos")
    parser.add_argument(
        "--metodo",
        choices=["rectangulos", "trapecio", "simpson"],
        required=True,
    )
    parser.add_argument(
        "--regla",
        choices=["left", "right", "midpoint"],
        default="midpoint",
        help="Solo aplica si --metodo rectangulos",
    )
    args = parser.parse_args()

    if args.b <= args.a:
        raise ValueError("Se requiere b > a.")
    if args.n <= 0:
        raise ValueError("n debe ser positivo.")

    f = lambda x: evaluar_expresion(args.f, {"x": x})

    i_aprox = integrar(f, args.metodo, args.a, args.b, args.n, args.regla)
    err_est, p_obs = estimar_error_richardson(
        f=f,
        metodo=args.metodo,
        regla=args.regla,
        a=args.a,
        b=args.b,
        n=args.n,
    )

    print("metodo=integracion_numerica")
    print(f"submetodo={args.metodo}")
    if args.metodo == "rectangulos":
        print(f"regla_rectangulos={args.regla}")
    print(f"intervalo=[{args.a:.12g},{args.b:.12g}]")
    print(f"n={args.n}")
    print(f"integral_aprox={i_aprox:.12g}")
    print(f"orden_teorico={orden_teorico(args.metodo, args.regla)}")
    print(f"error_estimado_richardson={err_est:.12g}")
    if p_obs is not None:
        print(f"orden_observado={p_obs:.6g}")


if __name__ == "__main__":
    main()

