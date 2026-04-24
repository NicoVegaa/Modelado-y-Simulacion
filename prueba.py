import numpy as np
import math as m

n=10000
a=0
b=1
z=1.96
np.random.seed(42)
x=np.random.uniform(a,b,n)
f_x=np.exp(-x**2)

integral_estimada=np.mean(f_x)*(b-a)
sigma_estimada=np.std(f_x,ddof=1)
ee=z*sigma_estimada/np.sqrt(n)
IC_izquierdo=integral_estimada-ee
IC_derecho=integral_estimada+ee
print(f'Integral estimada: {integral_estimada:.6f}')
print(f'Error estandar estimado: {ee:.6f}')
print(f'Intervalo de confianza al 95%: [{IC_izquierdo:.6f}, {IC_derecho:.6f}]')
