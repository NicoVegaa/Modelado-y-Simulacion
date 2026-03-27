"""
Metodo del punto fijo para buscar raices usando x = g(x).

Incluye:
- Tabla de iteraciones.
- Grafica con cobweb (saltos) y y=x.
- Interfaz Tkinter.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Dict, List, Tuple

import tkinter as tk
from tkinter import messagebox, ttk

from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure


@dataclass
class IteracionPuntoFijo:
    i: int
    x: float
    gx: float
    error: float


def punto_fijo(
    g: Callable[[float], float],
    x0: float,
    tol: float = 1e-6,
    max_iter: int = 100,
) -> tuple[float, float, int, List[IteracionPuntoFijo]]:
    """
    Itera x_{n+1} = g(x_n) hasta converger.

    Retorna: (raiz_aprox, error, iteraciones_usadas, historial)
    """
    historial: List[IteracionPuntoFijo] = []
    x = x0

    for i in range(1, max_iter + 1):
        gx = g(x)
        error = abs(gx - x)
        historial.append(IteracionPuntoFijo(i, x, gx, error))

        if error < tol:
            return gx, error, i, historial

        x = gx

    return x, abs(g(x) - x), max_iter, historial


def _build_ejemplos() -> Dict[str, Tuple[Callable[[float], float], float]]:
    return {
        "Ejemplo recomendado: g(x)=cos(x)": (lambda x: __import__("math").cos(x), 0.5),
        "g(x)=sqrt(2)": (lambda x: 2**0.5, 1.0),
        "g(x)=(x+2)^(1/3)": (lambda x: (x + 2) ** (1 / 3), 1.0),
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

    def g(x: float) -> float:
        return float(eval(expr, {"__builtins__": {}}, {"x": x, **env}))

    return g


def _gui() -> None:
    root = tk.Tk()
    root.title("Punto Fijo - Tabla y Cobweb")
    root.geometry("1100x720")

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

    ttk.Label(controls, text="x0").grid(row=0, column=2, sticky="w")
    x0_var = tk.StringVar(value="0.5")
    x0_entry = ttk.Entry(controls, width=10, textvariable=x0_var)
    x0_entry.grid(row=0, column=3, sticky="w", padx=(0, 12))

    ttk.Label(controls, text="tolerancia").grid(row=0, column=4, sticky="w")
    tol_var = tk.StringVar(value="1e-6")
    tol_entry = ttk.Entry(controls, width=10, textvariable=tol_var)
    tol_entry.grid(row=0, column=5, sticky="w", padx=(0, 12))

    ttk.Label(controls, text="max_iter").grid(row=0, column=6, sticky="w")
    max_iter_var = tk.StringVar(value="100")
    max_iter_entry = ttk.Entry(controls, width=8, textvariable=max_iter_var)
    max_iter_entry.grid(row=0, column=7, sticky="w")

    calcular_btn = ttk.Button(controls, text="Calcular")
    calcular_btn.grid(row=0, column=8, sticky="w", padx=(12, 0))

    # Funcion personalizada
    funcion_frame = ttk.Frame(frm)
    funcion_frame.pack(fill="x", pady=(6, 0))
    ttk.Label(funcion_frame, text="g(x)").grid(
        row=0, column=0, sticky="w", padx=(0, 6)
    )
    funcion_var = tk.StringVar(value="cos(x)")
    funcion_entry = ttk.Entry(funcion_frame, textvariable=funcion_var, width=40)
    funcion_entry.grid(row=0, column=1, sticky="w", padx=(0, 12))
    usar_funcion_var = tk.BooleanVar(value=False)
    usar_funcion_chk = ttk.Checkbutton(
        funcion_frame, text="Usar funcion personalizada", variable=usar_funcion_var
    )
    usar_funcion_chk.grid(row=0, column=2, sticky="w")

    recomendacion = ttk.Label(
        frm,
        text=(
            "Recomendado: usar g(x)=cos(x) con x0=0.5 para ver la convergencia "
            "y el cobweb."
        ),
    )
    recomendacion.pack(fill="x", pady=(8, 4))

    # Grafica
    fig = Figure(figsize=(6, 3.2), dpi=100)
    ax = fig.add_subplot(111)
    ax.set_title("Cobweb de punto fijo")
    ax.set_xlabel("x")
    ax.set_ylabel("g(x)")
    canvas = FigureCanvasTkAgg(fig, master=frm)
    canvas_widget = canvas.get_tk_widget()
    canvas_widget.pack(fill="x", pady=(4, 8))

    # Tabla
    columns = ("i", "x", "g(x)", "error")
    tree = ttk.Treeview(frm, columns=columns, show="headings", height=14)
    for col in columns:
        tree.heading(col, text=col)
        tree.column(col, width=160, anchor="center")
    tree.pack(fill="both", expand=True)

    result_var = tk.StringVar(value="Resultado: -")
    result_label = ttk.Label(frm, textvariable=result_var)
    result_label.pack(fill="x", pady=(6, 0))

    def _usar_ejemplo() -> None:
        g, x0 = ejemplos[ejemplo_var.get()]
        x0_var.set(str(x0))
        funcion_var.set("cos(x)")
        usar_funcion_var.set(False)

    def _calcular() -> None:
        for item in tree.get_children():
            tree.delete(item)

        try:
            if usar_funcion_var.get():
                g = _parse_function(funcion_var.get().strip())
            else:
                g, _ = ejemplos[ejemplo_var.get()]
            x0 = float(x0_var.get())
            tol = float(tol_var.get())
            max_iter = int(max_iter_var.get())
            raiz, error, iters, historial = punto_fijo(g, x0, tol=tol, max_iter=max_iter)
        except Exception as exc:
            messagebox.showerror("Error", str(exc))
            result_var.set("Resultado: error en los datos.")
            return

        for it in historial:
            tree.insert(
                "",
                "end",
                values=(it.i, f"{it.x:.6f}", f"{it.gx:.6f}", f"{it.error:.3e}"),
            )

        # Grafica: g(x) y y=x + cobweb
        try:
            ax.clear()
            ax.set_title("Cobweb de punto fijo")
            ax.set_xlabel("x")
            ax.set_ylabel("g(x)")

            # rango alrededor de la iteracion
            xs = [it.x for it in historial]
            min_x = min(xs + [raiz]) - 0.5
            max_x = max(xs + [raiz]) + 0.5
            if min_x == max_x:
                min_x -= 1.0
                max_x += 1.0

            n = 400
            grid = [min_x + (max_x - min_x) * i / (n - 1) for i in range(n)]
            ys = [g(x) for x in grid]
            ax.plot(grid, ys, label="g(x)")
            ax.plot(grid, grid, color="gray", linewidth=1, label="y=x")

            # Cobweb
            x = x0
            for _ in range(len(historial)):
                y = g(x)
                ax.plot([x, x], [x, y], color="red", linewidth=1)
                ax.plot([x, y], [y, y], color="red", linewidth=1)
                x = y

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
    calcular_btn.configure(command=_calcular)

    root.mainloop()


if __name__ == "__main__":
    _gui()
