# Armonía 🎵

Aplicación web para gestionar **instrumentos musicales** y sus **marcas**, desarrollada solo con **HTML, CSS y JavaScript** (sin librerías ni frameworks). Proyecto realizado en el marco de una experiencia COIL entre la UFPSO (Colombia) y la UIDE (Ecuador).

## Características

- Inicio de sesión, registro y recuperación de contraseña.
- Dashboard con resumen: total de instrumentos, total de marcas, instrumentos activos, valor del inventario, gráfico por marca y últimos instrumentos agregados.
- CRUD completo de **Instrumentos** y **Marcas**: agregar, listar, editar y eliminar.
- Tablas con buscador, selector de entradas, ordenamiento por columna y paginación.
- Validaciones en los formularios y confirmación antes de eliminar.
- Una marca con instrumentos asociados no se puede eliminar.
- Diseño responsive.

## Cómo ejecutarlo

No necesita instalación ni servidor:

1. Clona o descarga el repositorio.
2. Abre `login.html` en tu navegador.
3. Entra con la cuenta de prueba o crea una nueva en *Registrar*:

   | Email | Contraseña |
   |---|---|
   | `admin@correo.com` | `123456` |

> Los datos se guardan en el `localStorage` del navegador, por lo que son locales a cada equipo. Para restablecerlos, borra los datos del sitio desde las herramientas del navegador.

## Estructura

```
├── index.html               # Dashboard
├── instrumentos.html        # CRUD de instrumentos
├── marcas.html              # CRUD de marcas
├── login.html
├── register.html
├── recover-password.html
├── css/
│   └── style.css            # Estilos
└── js/
    ├── app.js               # Utilidades: datos, sesión, menú, tabla, modal
    ├── instrumentos.js      # Lógica de instrumentos
    └── marcas.js            # Lógica de marcas
```

## Tecnologías

HTML5 · CSS3 · JavaScript (ES6) · localStorage

## Integrantes

- Ronal Alexander Carvajalino Vega — UFPSO, Colombia
- Joel Jerónimo Pacheco Bayona — UFPSO, Colombia
- Jaider Daniel Ortega — UFPSO, Colombia
- Julian Andrade — UIDE, Ecuador
