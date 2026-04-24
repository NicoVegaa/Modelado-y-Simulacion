#!/usr/bin/env python3
"""Utilidades comunes para los scripts de metodos numericos."""

from __future__ import annotations

import math
from typing import Dict, Iterable, List, Sequence, Tuple


ALLOWED_NAMES = {name: getattr(math, name) for name in dir(math) if not name.startswith("_")}
ALLOWED_NAMES.update({"abs": abs, "min": min, "max": max, "pow": pow})


def evaluar_expresion(expr: str, variables: Dict[str, float]) -> float:
    """Evalua una expresion matematica usando un entorno acotado."""
    scope = dict(ALLOWED_NAMES)
    scope.update(variables)
    try:
        value = eval(expr, {"__builtins__": {}}, scope)
    except Exception as exc:  # pragma: no cover - error path
        raise ValueError(f"No se pudo evaluar la expresion '{expr}': {exc}") from exc

    if not isinstance(value, (int, float)):
        raise ValueError(f"La expresion '{expr}' no devolvio un numero.")
    if not math.isfinite(float(value)):
        raise ValueError(f"La expresion '{expr}' devolvio un valor no finito.")
    return float(value)


def parse_float_list(raw: str, sep: str = ",") -> List[float]:
    """Convierte un texto tipo '1,2,3' en lista de floats."""
    if raw is None or not raw.strip():
        raise ValueError("La lista de numeros esta vacia.")
    out: List[float] = []
    for part in raw.split(sep):
        part = part.strip()
        if not part:
            continue
        out.append(float(part))
    if not out:
        raise ValueError("La lista de numeros esta vacia.")
    return out


def parse_bounds(raw: str) -> List[Tuple[float, float]]:
    """Parsea intervalos: '0,1; -2,2' -> [(0,1), (-2,2)]."""
    if raw is None or not raw.strip():
        raise ValueError("Debes informar limites en formato 'a,b; c,d; ...'.")
    bounds: List[Tuple[float, float]] = []
    for chunk in raw.split(";"):
        chunk = chunk.strip()
        if not chunk:
            continue
        vals = parse_float_list(chunk, sep=",")
        if len(vals) != 2:
            raise ValueError(f"Limite invalido '{chunk}'. Usa 'min,max'.")
        lo, hi = vals
        if hi <= lo:
            raise ValueError(f"Intervalo invalido '{chunk}': se requiere max > min.")
        bounds.append((lo, hi))
    if not bounds:
        raise ValueError("No se detectaron intervalos validos.")
    return bounds


def check_uniform_grid(x: Sequence[float], tol: float = 1e-12) -> float:
    """Verifica malla uniforme y devuelve h."""
    if len(x) < 2:
        raise ValueError("Se requieren al menos 2 puntos en x.")
    hs = [x[i + 1] - x[i] for i in range(len(x) - 1)]
    if any(h <= 0 for h in hs):
        raise ValueError("Los valores de x deben ser estrictamente crecientes.")
    h0 = hs[0]
    for h in hs[1:]:
        if abs(h - h0) > tol * max(1.0, abs(h0)):
            raise ValueError("La malla de x no es uniforme.")
    return h0


def estimar_orden_desde_errores(errors: Sequence[float]) -> float | None:
    """Estima orden de convergencia p con 3 errores consecutivos."""
    if len(errors) < 3:
        return None
    e0, e1, e2 = errors[-3], errors[-2], errors[-1]
    if e0 <= 0 or e1 <= 0 or e2 <= 0:
        return None
    den = math.log(e1 / e0)
    if abs(den) < 1e-15:
        return None
    return math.log(e2 / e1) / den


def producto(values: Iterable[float]) -> float:
    out = 1.0
    for v in values:
        out *= v
    return out

