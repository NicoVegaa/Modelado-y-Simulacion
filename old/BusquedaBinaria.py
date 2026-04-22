"""
Algoritmo de biseccion (busqueda binaria de raices) en Python.

Ejemplo: encontrar raiz de f(x) = x^3 - x - 2 en [1, 2].
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Dict, List, Tuple

import tkinter as tk
from tkinter import messagebox, ttk

from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure


@dataclass
class IteracionBiseccion:
    i: int
    a: float
    b: float
    c: float
    fa: float
    fb: float
    fc: float


def biseccion(
    f: Callable[[float], float],
    a: float,
    b: float,
    tol: float = 1e-6,
    max_iter: int = 100,
) -> tuple[float, float, int, List[IteracionBiseccion]]:
    """
    Encuentra una raiz de f en el intervalo [a, b] usando biseccion.

    Requisitos: f(a) y f(b) deben tener signos opuestos.

    Retorna: (raiz_aprox, error_estimado, iteraciones_usadas, historial)
    """

    fa = f(a)
    fb = f(b)

    if fa == 0:
        return a, 0.0, 0, [IteracionBiseccion(0, a, b, a, fa, fb, fa)]
    if fb == 0:
        return b, 0.0, 0, [IteracionBiseccion(0, a, b, b, fa, fb, fb)]
    if fa * fb > 0:
        raise ValueError("f(a) y f(b) deben tener signos opuestos.")

    historial: List[IteracionBiseccion] = []
    c = (a + b) / 2.0
    fc = f(c)
    historial.append(IteracionBiseccion(1, a, b, c, fa, fb, fc))

    for i in range(2, max_iter + 1):
        if abs(fc) < tol or (b - a) / 2.0 < tol:
            error_estimado = (b - a) / 2.0
            return c, error_estimado, i - 1, historial

        if fa * fc < 0:
            b, fb = c, fc
        else:
            a, fa = c, fc

        c = (a + b) / 2.0
        fc = f(c)
        historial.append(IteracionBiseccion(i, a, b, c, fa, fb, fc))

    error_estimado = (b - a) / 2.0
    return c, error_estimado, max_iter, historial


def _build_ejemplos() -> Dict[str, Tuple[Callable[[float], float], float, float]]:
    return {
        "Ejemplo recomendado: x^3 - x - 2": (lambda x: x**3 - x - 2, 1.0, 2.0),
        "x^2 - 2": (lambda x: x**2 - 2, 1.0, 2.0),
        "cos(x) - x": (lambda x: __import__("math").cos(x) - x, 0.0, 1.0),
    }


def _build_safe_math_env() -> Dict[str, Callable[[float], float]]:
    import math

    allowed = {
        "sin",
        "cos",
        "tan",
        "asin",
        "acos",
        "atan",
        "exp",
        "log",
        "log10",
        "sqrt",
        "pi",
        "e",
        "fabs",
    }
    env: Dict[str, Callable[[float], float]] = {k: getattr(math, k) for k in allowed}
    env["abs"] = abs
    return env


def _parse_function(expr: str) -> Callable[[float], float]:
    env = _build_safe_math_env()

    def f(x: float) -> float:
        return float(eval(expr, {"__builtins__": {}}, {"x": x, **env}))

    return f


def _gui() -> None:
    root = tk.Tk()
    root.title("Biseccion - Tabla de iteraciones")
    root.geometry("1100x700")

    ejemplos = _build_ejemplos()

    frm = ttk.Frame(root, padding=12)
    frm.pack(fill="both", expand=True)

    # Controles
    controls = ttk.Frame(frm)
    controls.pack(fill="x")

    ttk.Label(controls, text="Ejemplo").grid(row=0, column=0, sticky="w", padx=(0, 6))
    ejemplo_var = tk.StringVar(value=list(ejemplos.keys())[0])
    ejemplo_menu = ttk.OptionMenu(
        controls, ejemplo_var, ejemplo_var.get(), *ejemplos.keys()
    )
    ejemplo_menu.grid(row=0, column=1, sticky="w", padx=(0, 12))

    ttk.Label(controls, text="a").grid(row=0, column=2, sticky="w")
    a_var = tk.StringVar(value="1.0")
    a_entry = ttk.Entry(controls, width=10, textvariable=a_var)
    a_entry.grid(row=0, column=3, sticky="w", padx=(0, 12))

    ttk.Label(controls, text="b").grid(row=0, column=4, sticky="w")
    b_var = tk.StringVar(value="2.0")
    b_entry = ttk.Entry(controls, width=10, textvariable=b_var)
    b_entry.grid(row=0, column=5, sticky="w", padx=(0, 12))

    ttk.Label(controls, text="tolerancia").grid(row=0, column=6, sticky="w")
    tol_var = tk.StringVar(value="1e-6")
    tol_entry = ttk.Entry(controls, width=10, textvariable=tol_var)
    tol_entry.grid(row=0, column=7, sticky="w", padx=(0, 12))

    ttk.Label(controls, text="max_iter").grid(row=0, column=8, sticky="w")
    max_iter_var = tk.StringVar(value="100")
    max_iter_entry = ttk.Entry(controls, width=8, textvariable=max_iter_var)
    max_iter_entry.grid(row=0, column=9, sticky="w")

    # Boton calcular en la fila principal (visible siempre)
    calcular_btn = ttk.Button(controls, text="Calcular")
    calcular_btn.grid(row=0, column=10, sticky="w", padx=(12, 0))

    # Funcion personalizada
    funcion_frame = ttk.Frame(frm)
    funcion_frame.pack(fill="x", pady=(6, 0))
    ttk.Label(funcion_frame, text="Funcion f(x)").grid(
        row=0, column=0, sticky="w", padx=(0, 6)
    )
    funcion_var = tk.StringVar(value="x**3 - x - 2")
    funcion_entry = ttk.Entry(funcion_frame, textvariable=funcion_var, width=40)
    funcion_entry.grid(row=0, column=1, sticky="w", padx=(0, 12))
    usar_funcion_var = tk.BooleanVar(value=False)
    usar_funcion_chk = ttk.Checkbutton(
        funcion_frame, text="Usar funcion personalizada", variable=usar_funcion_var
    )
    usar_funcion_chk.grid(row=0, column=2, sticky="w")

    # Recomendacion
    recomendacion = ttk.Label(
        frm,
        text=(
            "Recomendado: usar el ejemplo x^3 - x - 2 con a=1 y b=2 "
            "para ver el proceso y la grafica."
        ),
    )
    recomendacion.pack(fill="x", pady=(8, 4))

    # Grafica
    fig = Figure(figsize=(6, 3.2), dpi=100)
    ax = fig.add_subplot(111)
    ax.set_title("Grafica de f(x)")
    ax.set_xlabel("x")
    ax.set_ylabel("f(x)")
    canvas = FigureCanvasTkAgg(fig, master=frm)
    canvas_widget = canvas.get_tk_widget()
    canvas_widget.pack(fill="x", pady=(4, 8))

    # Tabla
    columns = ("i", "a", "b", "c", "fa", "fb", "fc")
    tree = ttk.Treeview(frm, columns=columns, show="headings", height=14)
    for col in columns:
        tree.heading(col, text=col)
        tree.column(col, width=120, anchor="center")
    tree.pack(fill="both", expand=True)

    # Resultados
    result_var = tk.StringVar(value="Resultado: -")
    result_label = ttk.Label(frm, textvariable=result_var)
    result_label.pack(fill="x", pady=(6, 0))

    def _usar_ejemplo() -> None:
        f, a0, b0 = ejemplos[ejemplo_var.get()]
        a_var.set(str(a0))
        b_var.set(str(b0))
        funcion_var.set("x**3 - x - 2")
        usar_funcion_var.set(False)

    def _calcular() -> None:
        # Limpiar tabla
        for item in tree.get_children():
            tree.delete(item)

        try:
            if usar_funcion_var.get():
                f = _parse_function(funcion_var.get().strip())
            else:
                f, _, _ = ejemplos[ejemplo_var.get()]
            a = float(a_var.get())
            b = float(b_var.get())
            tol = float(tol_var.get())
            max_iter = int(max_iter_var.get())
            raiz, error, iters, historial = biseccion(f, a, b, tol=tol, max_iter=max_iter)
        except Exception as exc:
            messagebox.showerror("Error", str(exc))
            result_var.set("Resultado: error en los datos.")
            return

        for it in historial:
            tree.insert(
                "",
                "end",
                values=(
                    it.i,
                    f"{it.a:.6f}",
                    f"{it.b:.6f}",
                    f"{it.c:.6f}",
                    f"{it.fa:.6e}",
                    f"{it.fb:.6e}",
                    f"{it.fc:.6e}",
                ),
            )

        # Grafica
        try:
            ax.clear()
            ax.set_title("Grafica de f(x)")
            ax.set_xlabel("x")
            ax.set_ylabel("f(x)")
            n = 400
            xs = [a + (b - a) * i / (n - 1) for i in range(n)]
            ys = [f(x) for x in xs]
            ax.plot(xs, ys, label="f(x)")
            ax.axhline(0, color="gray", linewidth=1)
            ax.axvline(raiz, color="red", linestyle="--", label="raiz aprox")
            ax.legend(loc="best")
            canvas.draw()
        except Exception:
            pass

        result_var.set(
            f"Resultado: raiz ~= {raiz:.6f} | error ~= {error:.3e} | iteraciones = {iters}"
        )

    btns = ttk.Frame(frm)
    btns.pack(fill="x", pady=(6, 0))
    ttk.Button(btns, text="Usar ejemplo", command=_usar_ejemplo).pack(
        side="left", padx=(0, 8)
    )
    ttk.Button(btns, text="Calcular", command=_calcular).pack(side="left")

    # Enlazar el boton superior al mismo calculo
    calcular_btn.configure(command=_calcular)

    root.mainloop()


if __name__ == "__main__":
    _gui()
