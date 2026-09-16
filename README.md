# Catálogo Hot Wheels

Landing estática para mostrar el stock de Hot Wheels, dejar que el cliente elija los que quiere
y enviar la reserva por WhatsApp. Sin backend, sin build: Vercel la publica tal cual.

- Precio normal: **S/ 17** por carrito (un modelo puede tener el suyo: la Toyota Supra de HW: The '90s está a S/ 25)
- Recojo: **Solari Plaza 1079**
- WhatsApp de reservas: **51959808052**

## Estructura

```
index.html        la landing
styles.css        estilos
app.js            filtro, selección, total y link de WhatsApp
cars.json         los 39 modelos (lo genera el script, no lo edites a mano salvo para corregir un nombre)
img/              fotos optimizadas en WebP
originales/       fotos JPEG originales (no se publican)
tools/            script de optimización (no se publica)
```

## Cambiar número, precio o dirección

Están en las primeras líneas de `app.js`:

```js
const WHATSAPP = '51959808052';
const PRECIO = 17;
const DIRECCION = 'Solari Plaza 1079';
```

(El precio y la dirección también aparecen como texto en `index.html`.)

## Agregar o quitar modelos

1. Copia las fotos nuevas a la raíz del proyecto.
2. Agrega una línea por modelo en `tools/models.json`:

   ```json
   { "id": "nombre-del-modelo", "name": "Nombre del modelo", "serie": "HW Exotics", "qty": 1,
     "file": "foto.jpeg" }
   ```

   - `qty`: cuántas unidades tienes de ese modelo (si es 2 o más, la tarjeta muestra "2 disponibles").
   - `price`: opcional. Sin esta clave el modelo cuesta S/ 17; con `"price": 25` cuesta 25 y el total
     y el mensaje de WhatsApp lo suman correcto.
   - `rotate`: opcional, en grados (90, 180, 270) si la foto salió de lado.

3. Regenera las imágenes y `cars.json`:

   ```bash
   cd tools
   npm install      # solo la primera vez
   node optimize-images.mjs
   ```

   El script endereza, reduce a 820 px de alto, convierte a WebP y mueve los JPEG a `originales/`.

Para marcar un modelo como vendido, borra su línea de `tools/models.json` y vuelve a correr el script
(o borra la entrada directamente de `cars.json` si tienes apuro).

## Publicar en Vercel

Opción rápida, desde la raíz del proyecto:

```bash
npx vercel          # login + preview (framework: Other, output: la raíz)
npx vercel --prod   # publicar
```

Opción con GitHub: `git init`, commit, sube el repo e impórtalo en vercel.com — detecta solo que es
un sitio estático.

`originales/` y `tools/` quedan fuera del deploy gracias a `.vercelignore`.

## Ver el sitio en local

```bash
npx serve .
```

y abre la URL que imprime (no abras `index.html` con doble clic: `fetch` de `cars.json` no funciona
con `file://`).
