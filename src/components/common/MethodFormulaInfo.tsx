import { BlockMath } from 'react-katex';

type MethodId =
  | 'biseccion'
  | 'punto-fijo'
  | 'aitken'
  | 'newton-raphson'
  | 'lagrange'
  | 'dif-finitas'
  | 'newton-cotes'
  | 'montecarlo';

interface FormulaSection {
  title: string;
  bullets?: string[];
  equations?: string[];
}

interface FormulaData {
  title: string;
  sections: FormulaSection[];
}

const formulasByMethod: Record<MethodId, FormulaData> = {
  biseccion: {
    title: 'Formulario: Biseccion',
    sections: [
      {
        title: 'Hipotesis',
        bullets: ['Intervalo [a,b] con cambio de signo: f(a)f(b) < 0.'],
      },
      {
        title: 'Iteracion',
        equations: ['c = \\frac{a+b}{2}'],
      },
      {
        title: 'Actualizacion de intervalo',
        bullets: [
          'Si f(c) \neq 0 y f(a)f(c) < 0, entonces la raiz queda en [a,c] y se actualiza b = c.',
          'Si f(c) \neq 0 y f(b)f(c) < 0, entonces la raiz queda en [c,b] y se actualiza a = c.',
        ],
      },
    ],
  },
  'punto-fijo': {
    title: 'Formulario: Punto Fijo',
    sections: [
      {
        title: 'Reescritura e iteracion',
        equations: ['f(x)=0 \\Rightarrow x=g(x)', 'x_{i+1}=g(x_i)'],
      },
      {
        title: 'Criterios de convergencia con g\'(x0)',
        bullets: [
          '|g\'(x_0)| < 1: converge.',
          '-1 < g\'(x_0) < 0: convergencia espiral (oscilatoria).',
          '0 < g\'(x_0) < 1: convergencia escalonada (monotona).',
          '|g\'(x_0)| > 1: diverge.',
        ],
      },
    ],
  },
  aitken: {
    title: 'Formulario: Aceleracion de Aitken',
    sections: [
      {
        title: 'Secuencia base',
        equations: ['x_{n+1}=g(x_n)', 'x_{n+2}=g(x_{n+1})'],
      },
      {
        title: 'Aceleracion Delta-cuadrado',
        equations: ['x_n^*=x_n-\\frac{(x_{n+1}-x_n)^2}{x_{n+2}-2x_{n+1}+x_n}'],
      },
      {
        title: 'Interpretacion',
        bullets: [
          'x_n: termino original de la sucesion.',
          'x_n^*: termino acelerado.',
          'Se requieren 3 iterados consecutivos.',
        ],
      },
    ],
  },
  'newton-raphson': {
    title: 'Formulario: Newton-Raphson',
    sections: [
      {
        title: 'Iteracion',
        equations: ['x_{n+1}=x_n-\\frac{f(x_n)}{f\'(x_n)}'],
      },
      {
        title: 'Notas',
        bullets: [
          'Convergencia rapida si x0 esta cerca de la raiz.',
          'Puede fallar si f\'(x_n) = 0 o si x0 esta lejos.',
        ],
      },
    ],
  },
  lagrange: {
    title: 'Formulario: Interpolacion de Lagrange',
    sections: [
      {
        title: 'Polinomio interpolante',
        equations: ['P(x)=\\sum_{i=0}^{n}y_iL_i(x)'],
      },
      {
        title: 'Bases de Lagrange',
        equations: ['L_i(x)=\\prod_{\\substack{j=0 \\ j\\neq i}}^{n}\\frac{x-x_j}{x_i-x_j}'],
      },
      {
        title: 'Error de interpolacion',
        equations: ['f(x)-P(x)=\\frac{f^{(n+1)}(\\xi)}{(n+1)!}\\prod_{i=0}^{n}(x-x_i)'],
        bullets: ['Con x_0 < \\xi < x_n.'],
      },
      {
        title: 'Pasos para errores global/local',
        bullets: [
          '1) Construir P(x).',
          '2) Calcular prod (x - x_i).',
          '3) Acotar M_(n+1) = max |f^(n+1)(xi)| en el intervalo.',
          '4) Cota global: |E(x)| <= M_(n+1)/(n+1)! * |prod (x - x_i)|.',
          '5) Error local: |f(x) - P(x)|.',
        ],
      },
    ],
  },
  'dif-finitas': {
    title: 'Formulario: Diferencias Finitas',
    sections: [
      {
        title: 'Progresivas',
        equations: [
          'f\'(x_i)=\\frac{f(x_{i+1})-f(x_i)}{h}',
          'f\'' + "'" + '(x_i)=\\frac{f(x_{i+2})-2f(x_{i+1})+f(x_i)}{h^2}',
        ],
      },
      {
        title: 'Regresivas',
        equations: [
          'f\'(x_i)=\\frac{f(x_i)-f(x_{i-1})}{h}',
          'f\'' + "'" + '(x_i)=\\frac{f(x_i)-2f(x_{i-1})+f(x_{i-2})}{h^2}',
        ],
      },
      {
        title: 'Centrales',
        equations: [
          'f\'(x_i)=\\frac{f(x_{i+1})-f(x_{i-1})}{2h}',
          'f\'' + "'" + '(x_i)=\\frac{f(x_{i+1})-2f(x_i)+f(x_{i-1})}{h^2}',
        ],
      },
    ],
  },
  'newton-cotes': {
    title: 'Formulario: Newton-Cotes e Integracion',
    sections: [
      {
        title: 'Rectangulo medio (compuesta)',
        equations: [
          '\\int_a^b f(x)\\,dx \\approx h\\sum_{i=1}^{n}f\\!\\left(\\frac{x_{i-1}+x_i}{2}\\right)',
          'h=\\frac{b-a}{n}',
        ],
      },
      {
        title: 'Trapecio compuesto',
        equations: [
          '\\int_a^b f(x)\\,dx \\approx \\frac{h}{2}\\left[f(a)+2\\sum_{i=1}^{n-1}f(a+ih)+f(b)\\right]',
          'E_T=-\\frac{(b-a)^3}{12n^2}f\'' + "'" + '(\\xi)',
        ],
      },
      {
        title: 'Simpson 1/3 simple',
        equations: [
          '\\int_a^b f(x)\\,dx \\approx \\frac{h}{3}\\left[f(a)+4f\\!\\left(\\frac{a+b}{2}\\right)+f(b)\\right]',
          'h=\\frac{b-a}{2}',
          'E=-\\frac{(b-a)^5}{2880}f^{(4)}(\\xi)= -\\frac{h^5}{90}f^{(4)}(\\xi)',
        ],
      },
      {
        title: 'Simpson 1/3 compuesta (n par)',
        equations: [
          '\\int_a^b f(x)\\,dx \\approx \\frac{h}{3}\\left[f(a)+4\\sum_{i\\,\\text{impar}}f(a+ih)+2\\sum_{i\\,\\text{par}}f(a+ih)+f(b)\\right]',
          'E_{comp}=-\\frac{(b-a)^5}{180n^4}f^{(4)}(\\xi)= -\\frac{(b-a)}{180}h^4f^{(4)}(\\xi)',
        ],
        bullets: ['Se requiere n par para Simpson 1/3 compuesta.'],
      },
    ],
  },
  montecarlo: {
    title: 'Formulario: Montecarlo',
    sections: [
      {
        title: 'Estimacion de integral por muestreo',
        equations: ['\\int_a^b f(x)\\,dx \\approx (b-a)\\frac{1}{N}\\sum_{i=1}^{N}f(x_i)'],
        bullets: ['x_i aleatorio en [a,b].'],
      },
      {
        title: 'Interpretacion',
        bullets: ['La precision mejora al aumentar N (ley de grandes numeros).'],
      },
    ],
  },
};

interface MethodFormulaInfoProps {
  method: MethodId;
}

export const MethodFormulaInfo = ({ method }: MethodFormulaInfoProps) => {
  const data = formulasByMethod[method];

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h3 className="text-base font-semibold text-slate-900">{data.title}</h3>
      <div className="mt-3 space-y-3 text-sm text-slate-700">
        {data.sections.map((section) => (
          <div key={section.title}>
            <p className="font-semibold text-slate-800">{section.title}</p>
            {section.bullets ? (
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {section.bullets.map((line, idx) => (
                  <li key={`${section.title}-b-${idx}`} className="break-words text-xs">
                    {line}
                  </li>
                ))}
              </ul>
            ) : null}
            {section.equations ? (
              <div className="mt-2 space-y-1 overflow-x-auto rounded-md bg-slate-50 p-2">
                {section.equations.map((eq, idx) => (
                  <BlockMath key={`${section.title}-e-${idx}`} math={eq} />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};
