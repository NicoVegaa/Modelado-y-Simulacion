# Calculadora de Modelado y Simulacion (SPA)

Aplicacion web SPA construida con React + TypeScript para resolver ejercicios de la materia.

## Estado actual

- Navegacion por 8 tabs implementada.
- Tab Biseccion funcional con:
  - evaluacion de f(x) con mathjs,
  - tabla de iteraciones,
  - resultado final,
  - grafico de f(x) con raiz marcada,
  - ejemplos precargados,
  - boton Limpiar y Copiar resultados CSV.
- Tab Newton-Raphson funcional inicial con:
  - derivada analitica opcional,
  - derivada numerica automatica si no se ingresa f'(x),
  - tabla de iteraciones,
  - resultado final,
  - ejemplos precargados,
  - boton Limpiar y Copiar resultados CSV.
- En los campos sensibles se incluyeron micro-aclaratorios en estilo italico/chico.

## Requisitos

Necesitas Node.js instalado para ejecutar npm.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run test
```

## Estructura legacy

Las implementaciones anteriores en Python/HTML fueron preservadas en la carpeta old.

## Pendientes

- Implementar completamente: Punto Fijo, Aitken, Lagrange, Dif. Finitas, Newton-Cotes, Montecarlo.
- Agregar visualizaciones especificas avanzadas (por ejemplo tangentes animadas en Newton-Raphson).
