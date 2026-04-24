# Scripts de Modelado y Simulacion

Cada metodo esta separado en su propio archivo `.py`.

## Instalacion rapida (cualquier PC)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> Nota: este proyecto usa solo libreria estandar, por eso `requirements.txt` no instala paquetes extra.

## 1) Biseccion (busqueda binaria de raices)
Archivo: `biseccion_raices.py`

```bash
python3 biseccion_raices.py --f "x**3-x-2" --a 1 --b 2 --tol 1e-8 --mostrar-historial
```

## 2) Punto fijo (contracciones)
Archivo: `punto_fijo.py`

```bash
python3 punto_fijo.py --g "cos(x)" --x0 0.5 --tol 1e-8 --lipschitz 0.7 --mostrar-historial
```

## 3) Newton-Raphson
Archivo: `newton_raphson.py`

```bash
python3 newton_raphson.py --f "x**3-x-2" --df "3*x**2-1" --x0 1.5 --tol 1e-10 --mostrar-historial
```

Newton con derivada numerica:

```bash
python3 newton_raphson.py --f "cos(x)-x" --x0 0.7 --tol 1e-10
```

## 4) Aceleracion Aitken Delta^2
Archivo: `aitken_delta2.py`

Con secuencia dada:

```bash
python3 aitken_delta2.py --seq "1,0.5,0.333333,0.25,0.2"
```

Generando secuencia con `g(x)`:

```bash
python3 aitken_delta2.py --g "cos(x)" --x0 0.5 --n 10
```

## 5) Interpolacion de Lagrange
Archivo: `interpolacion_lagrange.py`

```bash
python3 interpolacion_lagrange.py --x "0,1,2" --y "1,3,2" --x-eval "0.5,1.5"
```

Con funcion real para error:

```bash
python3 interpolacion_lagrange.py --x "0,0.5,1.0" --y "0,0.4794255,0.8414709" --x-eval "0.2,0.8" --f-real "sin(x)"
```

## 6) Derivacion numerica
Archivo: `derivacion_numerica.py`

Desde datos discretos:

```bash
python3 derivacion_numerica.py datos --x "0,0.1,0.2,0.3" --y "0,0.0998334,0.198669,0.295520" --tipo primera --esquema central
```

Derivadas parciales:

```bash
python3 derivacion_numerica.py parcial --f "x**2*y + sin(x*y)" --vars "x,y" --point "1.0,2.0" --var x --orden 1 --esquema central --h 1e-5
```

Paso optimo (diferencia central primera derivada):

```bash
python3 derivacion_numerica.py paso-optimo --f "exp(x)" --d3f "exp(x)" --x0 0
```

## 7) Integracion numerica deterministica
Archivo: `integracion_numerica.py`

Rectangulos:

```bash
python3 integracion_numerica.py --f "sin(x)" --a 0 --b 3.141592653589793 --n 100 --metodo rectangulos --regla midpoint
```

Trapecio:

```bash
python3 integracion_numerica.py --f "sin(x)" --a 0 --b 3.141592653589793 --n 100 --metodo trapecio
```

Simpson:

```bash
python3 integracion_numerica.py --f "sin(x)" --a 0 --b 3.141592653589793 --n 100 --metodo simpson
```

## 8) Integracion Monte Carlo (1D y multidimensional)
Archivo: `integracion_montecarlo.py`

1D:

```bash
python3 integracion_montecarlo.py --f "x**2" --bounds "0,1" --n 100000 --seed 123 --alpha 0.05
```

2D:

```bash
python3 integracion_montecarlo.py --f "x1**2 + x2**2" --bounds "0,1;0,1" --n 200000 --seed 123
```

Con estimacion de `n` para un error objetivo:

```bash
python3 integracion_montecarlo.py --f "exp(-x)" --bounds "0,3" --n 10000 --target-error 0.01
```
