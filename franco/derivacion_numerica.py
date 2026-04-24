#!/usr/bin/env python3
"""Derivacion numerica desde datos y derivadas parciales por diferencias finitas."""

from __future__ import annotations

import argparse
import math
import sys
from typing import Dict, List, Tuple

from utils_numericos import check_uniform_grid, evaluar_expresion, parse_float_list


def derivada_datos(
    x: List[float],
    y: List[float],
    tipo: str,
    esquema: str,
    indice: int,
) -> Tuple[float, int]:
    h = check_uniform_grid(x)
    n = len(x)

    if tipo == "primera":
        if esquema == "forward":
            if not (0 <= indice <= n - 2):
                raise ValueError("Indice fuera de rango para esquema forward.")
            return (y[indice + 1] - y[indice]) / h, 1
        if esquema == "backward":
            if not (1 <= indice <= n - 1):
                raise ValueError("Indice fuera de rango para esquema backward.")
            return (y[indice] - y[indice - 1]) / h, 1
        if esquema == "central":
            if not (1 <= indice <= n - 2):
                raise ValueError("Indice fuera de rango para esquema central.")
            return (y[indice + 1] - y[indice - 1]) / (2.0 * h), 2
    elif tipo == "segunda":
        if esquema == "forward":
            if not (0 <= indice <= n - 3):
                raise ValueError("Indice fuera de rango para esquema forward.")
            return (y[indice] - 2 * y[indice + 1] + y[indice + 2]) / (h * h), 1
        if esquema == "backward":
            if not (2 <= indice <= n - 1):
                raise ValueError("Indice fuera de rango para esquema backward.")
            return (y[indice] - 2 * y[indice - 1] + y[indice - 2]) / (h * h), 1
        if esquema == "central":
            if not (1 <= indice <= n - 2):
                raise ValueError("Indice fuera de rango para esquema central.")
            return (y[indice + 1] - 2 * y[indice] + y[indice - 1]) / (h * h), 2

    raise ValueError("Combinacion tipo/esquema no valida.")


def indices_validos(n: int, tipo: str, esquema: str) -> range:
    if tipo == "primera":
        if esquema == "forward":
            return range(0, n - 1)
        if esquema == "backward":
            return range(1, n)
        return range(1, n - 1)
    if esquema == "forward":
        return range(0, n - 2)
    if esquema == "backward":
        return range(2, n)
    return range(1, n - 1)


def eval_f(expr: str, vars_names: List[str], point: List[float]) -> float:
    values: Dict[str, float] = {name: point[i] for i, name in enumerate(vars_names)}
    return evaluar_expresion(expr, values)


def parcial_finita(
    expr: str,
    vars_names: List[str],
    point: List[float],
    var_target: str,
    orden: int,
    esquema: str,
    h: float,
) -> Tuple[float, int]:
    if var_target not in vars_names:
        raise ValueError(f"La variable '{var_target}' no esta en --vars.")
    idx = vars_names.index(var_target)

    p0 = point[:]

    if orden == 1:
        if esquema == "forward":
            p1 = p0[:]
            p1[idx] += h
            val = (eval_f(expr, vars_names, p1) - eval_f(expr, vars_names, p0)) / h
            return val, 1
        if esquema == "backward":
            p1 = p0[:]
            p1[idx] -= h
            val = (eval_f(expr, vars_names, p0) - eval_f(expr, vars_names, p1)) / h
            return val, 1
        if esquema == "central":
            p1 = p0[:]
            p2 = p0[:]
            p1[idx] += h
            p2[idx] -= h
            val = (eval_f(expr, vars_names, p1) - eval_f(expr, vars_names, p2)) / (2.0 * h)
            return val, 2
    elif orden == 2:
        if esquema == "forward":
            p1 = p0[:]
            p2 = p0[:]
            p1[idx] += h
            p2[idx] += 2.0 * h
            val = (eval_f(expr, vars_names, p2) - 2.0 * eval_f(expr, vars_names, p1) + eval_f(expr, vars_names, p0)) / (h * h)
            return val, 1
        if esquema == "backward":
            p1 = p0[:]
            p2 = p0[:]
            p1[idx] -= h
            p2[idx] -= 2.0 * h
            val = (eval_f(expr, vars_names, p0) - 2.0 * eval_f(expr, vars_names, p1) + eval_f(expr, vars_names, p2)) / (h * h)
            return val, 1
        if esquema == "central":
            p1 = p0[:]
            p2 = p0[:]
            p1[idx] += h
            p2[idx] -= h
            val = (eval_f(expr, vars_names, p1) - 2.0 * eval_f(expr, vars_names, p0) + eval_f(expr, vars_names, p2)) / (h * h)
            return val, 2

    raise ValueError("Combinacion orden/esquema no valida.")


def paso_optimo_central_primera(expr_f: str, expr_d3f: str, x0: float, eps_maq: float) -> float:
    fx = evaluar_expresion(expr_f, {"x": x0})
    d3fx = evaluar_expresion(expr_d3f, {"x": x0})
    if abs(d3fx) < 1e-18:
        raise ValueError("La tercera derivada en x0 es muy pequena para estimar paso optimo.")
    h_opt = ((3.0 * eps_maq * abs(fx)) / abs(d3fx)) ** (1.0 / 3.0)
    return h_opt


def main() -> None:
    parser = argparse.ArgumentParser(description="Herramientas de derivacion numerica.")
    sub = parser.add_subparsers(dest="modo", required=True)

    p_datos = sub.add_parser("datos", help="Derivacion numerica desde muestras discretas (x,y)")
    p_datos.add_argument("--x", required=True, help="Lista de x, ej: 0,0.1,0.2")
    p_datos.add_argument("--y", required=True, help="Lista de y, mismo largo que x")
    p_datos.add_argument("--tipo", choices=["primera", "segunda"], default="primera")
    p_datos.add_argument("--esquema", choices=["forward", "backward", "central"], default="central")
    p_datos.add_argument(
        "--indice",
        type=int,
        default=None,
        help="Indice puntual. Si se omite, calcula en todos los indices validos",
    )

    p_parcial = sub.add_parser("parcial", help="Derivadas parciales por diferencias finitas")
    p_parcial.add_argument("--f", required=True, help="f en variables de --vars, ej: x**2*y + sin(x*y)")
    p_parcial.add_argument("--vars", required=True, help="Variables separadas por comas, ej: x,y")
    p_parcial.add_argument("--point", required=True, help="Punto separando por comas, ej: 1.0,2.0")
    p_parcial.add_argument("--var", required=True, help="Variable respecto de la cual derivar")
    p_parcial.add_argument("--orden", type=int, choices=[1, 2], default=1)
    p_parcial.add_argument("--esquema", choices=["forward", "backward", "central"], default="central")
    p_parcial.add_argument("--h", type=float, default=1e-5)

    p_opt = sub.add_parser(
        "paso-optimo",
        help="Paso optimo para f'(x) central con error de truncamiento+redondeo",
    )
    p_opt.add_argument("--f", required=True, help="Funcion f(x)")
    p_opt.add_argument("--d3f", required=True, help="Tercera derivada f'''(x)")
    p_opt.add_argument("--x0", type=float, required=True)
    p_opt.add_argument(
        "--eps-maq",
        type=float,
        default=sys.float_info.epsilon,
        help="Epsilon de maquina (default de Python float)",
    )

    args = parser.parse_args()

    if args.modo == "datos":
        x = parse_float_list(args.x)
        y = parse_float_list(args.y)
        if len(x) != len(y):
            raise ValueError("--x y --y deben tener el mismo largo.")
        if len(x) < 3:
            raise ValueError("Se requieren al menos 3 puntos para derivacion.")

        print("metodo=derivacion_numerica_datos")
        print(f"tipo={args.tipo}")
        print(f"esquema={args.esquema}")
        print("\nindice,x_i,derivada_aprox,orden_teorico")

        if args.indice is not None:
            val, orden = derivada_datos(x, y, args.tipo, args.esquema, args.indice)
            print(f"{args.indice},{x[args.indice]:.12g},{val:.12g},{orden}")
        else:
            for i in indices_validos(len(x), args.tipo, args.esquema):
                val, orden = derivada_datos(x, y, args.tipo, args.esquema, i)
                print(f"{i},{x[i]:.12g},{val:.12g},{orden}")
        return

    if args.modo == "parcial":
        vars_names = [v.strip() for v in args.vars.split(",") if v.strip()]
        point = parse_float_list(args.point)
        if len(vars_names) != len(point):
            raise ValueError("--vars y --point deben tener la misma cantidad de elementos.")
        val, orden_teorico = parcial_finita(
            expr=args.f,
            vars_names=vars_names,
            point=point,
            var_target=args.var,
            orden=args.orden,
            esquema=args.esquema,
            h=args.h,
        )
        print("metodo=derivadas_parciales_diferencias_finitas")
        print(f"variable={args.var}")
        print(f"orden_derivada={args.orden}")
        print(f"esquema={args.esquema}")
        print(f"h={args.h:.12g}")
        print(f"valor_aprox={val:.12g}")
        print(f"orden_teorico={orden_teorico}")
        return

    if args.modo == "paso-optimo":
        h_opt = paso_optimo_central_primera(args.f, args.d3f, args.x0, args.eps_maq)
        print("metodo=paso_optimo_derivacion")
        print("formula=h_opt=((3*eps*|f(x0)|)/|f'''(x0)|)^(1/3)")
        print(f"x0={args.x0:.12g}")
        print(f"eps_maq={args.eps_maq:.12g}")
        print(f"h_opt={h_opt:.12g}")
        return


if __name__ == "__main__":
    main()

