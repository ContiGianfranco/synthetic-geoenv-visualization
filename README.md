# Repositorio correspondiente a la tesis "Visualización On-line de Entornos Geográficos Sintéticos"

Este repositorio contiene varias implementaciones organizadas en carpetas independientes.
Cada carpeta corresponde a uno de los *benchmarks* realizados en este trabajo, o a la solución integradora desarrollada con **Three.js** y **CDB**.

---

## Requisitos

* **Node.js y npm** instalados (para proyectos JavaScript/TypeScript).
* **CMake y compilador C++** (para las implementaciones en OpenGL).

---

## Ejecución de los proyectos con Node.js

1. Ingresar a la carpeta de la implementación deseada:

   ```bash
   cd nombre-del-directorio
   ```
2. Instalar las dependencias:

   ```bash
   npm install
   ```
3. Ejecutar en modo desarrollo:

   ```bash
   npm run dev
   ```

---

## Ejecución de los proyectos con OpenGL (C++)

1. Ingresar a la carpeta:

   ```bash
   cd nombre-del-directorio
   ```
2. Crear una carpeta de compilación (`build`):

   ```bash
   mkdir build && cd build
   ```
3. Generar el proyecto con CMake:

   ```bash
   cmake ..
   ```
4. Compilar:

   ```bash
   cmake --build .
   ```
5. Ejecutar el binario generado (dependiendo del sistema operativo, por ejemplo en Linux/Mac):

   ```bash
   ./nombre-del-ejecutable
   ```

---

## Notas

* Cada implementación funciona de manera **independiente**.
* Revisar dentro de cada carpeta si existe un `README.md` específico con detalles adicionales.
* En la carpeta `Auxiliar` se encuentra el código utilizado para convertir las muestras obtenidas de la organización **GEBCO** a un archivo **.tif** compatible con los requerimientos de una base de datos **CDB**.
