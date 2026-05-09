# Movimiento de Pendulo
import numpy as np
import matplotlib.pyplot as plt

# 1. Definimos el paso de RK4 para un sistema de ecuaciones
def rk4_step(f, t, y, h):
    k1 = h * f(t, y)
    k2 = h * f(t + h/2, y + k1/2)
    k3 = h * f(t + h/2, y + k2/2)
    k4 = h * f(t + h, y + k3)
    return y + (k1 + 2*k2 + 2*k3 + k4) / 6

# 2. Definimos las ecuaciones del péndulo
# y[0] es el ángulo (theta), y[1] es la velocidad angular (omega)
def pendulum_system(t, y):
    g = 9.81  # m/s^2
    L = 1.0   # metros
    theta, omega = y
    d_theta = omega
    d_omega = -(g / L) * np.sin(theta)
    return np.array([d_theta, d_omega])

# 3. Parámetros de la simulación
h = 0.05       # Tamaño del paso (segundos)
t_final = 10   # Tiempo total
t_points = np.arange(0, t_final, h)
y0 = np.array([np.pi/4, 0.0])  # Soltamos desde 45 grados

# 4. Bucle de integración
history = []
y = y0
for t in t_points:
    history.append(y)
    y = rk4_step(pendulum_system, t, y, h)

history = np.array(history)

# 5. Visualización
plt.figure(figsize=(12, 5))

# Gráfica de Posición vs Tiempo
plt.subplot(1, 2, 1)
plt.plot(t_points, history[:, 0], 'b', label='Ángulo (rad)')
plt.title('Movimiento del Péndulo (RK4)')
plt.xlabel('Tiempo (s)')
plt.ylabel('Ángulo (rad)')
plt.grid(True)

# Gráfica del Espacio de Fases
plt.subplot(1, 2, 2)
plt.plot(history[:, 0], history[:, 1], 'r')
plt.title('Espacio de Fases (Órbita de Energía)')
plt.xlabel('Ángulo (rad)')
plt.ylabel('Velocidad Angular (rad/s)')
plt.grid(True)

plt.tight_layout()
plt.show()
