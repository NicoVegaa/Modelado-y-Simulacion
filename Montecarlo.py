import math
import random
import sys

SUPPORTED_FUNCTIONS = {
    'sin': math.sin,
    'cos': math.cos,
    'tan': math.tan,
    'asin': math.asin,
    'acos': math.acos,
    'atan': math.atan,
    'sinh': math.sinh,
    'cosh': math.cosh,
    'tanh': math.tanh,
    'exp': math.exp,
    'log': math.log,
    'log10': math.log10,
    'sqrt': math.sqrt,
    'abs': abs,
    'pow': pow,
    'pi': math.pi,
    'e': math.e,
}


def make_function(expression: str):
    def f(x):
        local_vars = {'x': x}
        local_vars.update(SUPPORTED_FUNCTIONS)
        return eval(expression, {'__builtins__': None}, local_vars)

    return f


def monte_carlo_integral(f, a: float, b: float, n: int, seed=None):
    if n <= 0:
        raise ValueError('El número de muestras n debe ser un entero positivo.')
    if seed is not None:
        random.seed(seed)

    ys = []
    for _ in range(n):
        x = random.uniform(a, b)
        ys.append(f(x))

    mean_y = sum(ys) / n
    if n > 1:
        variance_y = sum((y - mean_y) ** 2 for y in ys) / (n - 1)
    else:
        variance_y = 0.0
    stddev_y = math.sqrt(variance_y)
    integral_value = (b - a) * mean_y

    return integral_value, mean_y, stddev_y


def parse_arguments():
    if len(sys.argv) < 5:
        print('Uso: python Montecarlo.py "expresion" a b n [semilla]')
        print('Ejemplo: python Montecarlo.py "sin(x)" 0 3.1416 100000 42')
        print('Funciones soportadas: sin, cos, tan, exp, log, sqrt, abs, pow, etc.')
        sys.exit(1)

    expression = sys.argv[1]
    a = float(sys.argv[2])
    b = float(sys.argv[3])
    n = int(sys.argv[4])
    seed = int(sys.argv[5]) if len(sys.argv) > 5 else None
    return expression, a, b, n, seed


def main():
    expression, a, b, n, seed = parse_arguments()
    f = make_function(expression)

    try:
        integral_value, mean_y, stddev_y = monte_carlo_integral(f, a, b, n, seed)
    except Exception as error:
        print(f'Error al evaluar la función: {error}')
        sys.exit(1)

    print(f'Integral aproximada de {expression} en [{a}, {b}] con n={n}:')
    print(f'  Integral: {integral_value:.12f}')
    print(f'  Media aritmética de y: {mean_y:.12f}')
    print(f'  Desviación estándar de y: {stddev_y:.12f}')


if __name__ == '__main__':
    main()
