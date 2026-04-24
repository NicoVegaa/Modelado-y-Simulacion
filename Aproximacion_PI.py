import random
# Número de puntos aleatorios a generar
num_puntos = 10000000
puntos_dentro = 0
# Generamos los puntos aleatorios
for _ in range(num_puntos):
    x = random.uniform(-1, 1) # Coordenada x aleatoria en [-1, 1]
    y = random.uniform(-1, 1) # Coordenada y aleatoria en [-1, 1]
#¿El punto cayó dentro del círculo unitario? (Distancia al centro <= 1)
if x**2 + y**2 <= 1:
    puntos_dentro += 1
# Estimación de pi usando la relación de áreas
pi_estimado = (puntos_dentro / num_puntos) * 4
print(f"Estimación de π con {num_puntos} puntos: {pi_estimado}")