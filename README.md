# Modelado y Simulacion

Proyecto con implementaciones numericas en Python y HTML.

## Requisitos previos

- Python 3.10 o superior
- pip

## Instalar dependencias sin usar el entorno global

Este proyecto incluye el archivo `requirements.txt` para instalar dependencias.

### 1) Crear entorno virtual

En la raiz del proyecto:

```powershell
python -m venv .venv
```

### 2) Activar entorno virtual

PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Si aparece error de permisos en PowerShell, ejecuta una vez:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

CMD:

```bat
.venv\Scripts\activate.bat
```

### 3) Instalar dependencias

Con el entorno activado:

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 4) Ejecutar los scripts de Python

```powershell
python BusquedaBinaria.py
python PuntoFijo.py
```

### 5) Desactivar el entorno virtual

```powershell
deactivate
```

## Notas

- No instales dependencias globalmente para este proyecto.
- No subas la carpeta `.venv` al repositorio.
