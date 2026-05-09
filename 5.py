import numpy as np
import matplotlib.pyplot as plt

t = np.linspace(0, 10, 100)
signal = np.sin(t)

np.random.seed(0)  
mask = np.random.rand(len(signal)) > 0.3
received = signal.copy()
received[~mask] = np.nan 

Q = 0.01
R = 0.1 

x = 0.0
P = 1.0 

recon = []

for z in received: 
    x_pred = x
    P_pred = P + Q 

    if not np.isnan(z):
        K = P_pred / (P_pred + R)
        x = x_pred + K * (z - x_pred)
        P = (1 - K) * P_pred 
    else:
        x = x_pred
        P=P_pred

    recon.append(x)

plt.plot(signal, label="Original")
plt.plot(received,'.', label="Perdida")
plt.plot(recon, label="Kalman")
plt.legend()
plt.grid()
plt.show()