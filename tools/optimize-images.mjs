// Optimiza las fotos del catalogo:
//   - endereza la foto (EXIF, o el angulo indicado en models.json)
//   - la reduce a 900 px de alto y la convierte a WebP
//   - guarda el resultado en ../img/<id>.webp
//   - genera ../cars.json con los datos que lee la web
//   - mueve las fotos originales a ../originales/ (no se publican)
//
// Uso:  cd tools && npm install && node optimize-images.mjs

import { readFile, writeFile, mkdir, rename, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const TOOLS = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(TOOLS, '..')
const IMG = path.join(ROOT, 'img')
const ORIGINALES = path.join(ROOT, 'originales')

const ALTO_MAX = 820
const CALIDAD = 70
const PRECIO_BASE = 17 // soles; un modelo puede traer su propio "price" en models.json

// Busca la foto en la raiz del proyecto o, si ya se movio, en originales/
function ubicar (archivo) {
  for (const dir of [ROOT, ORIGINALES]) {
    const p = path.join(dir, archivo)
    if (existsSync(p)) return p
  }
  return null
}

const modelos = JSON.parse(await readFile(path.join(TOOLS, 'models.json'), 'utf8'))

await mkdir(IMG, { recursive: true })
await mkdir(ORIGINALES, { recursive: true })

const cars = []
let totalKB = 0

for (const modelo of modelos) {
  const origen = ubicar(modelo.file)
  if (!origen) {
    console.error(`  falta la foto de ${modelo.name}: ${modelo.file}`)
    continue
  }

  const destino = path.join(IMG, `${modelo.id}.webp`)
  const pipeline = sharp(origen).rotate(modelo.rotate ?? undefined)
  const { size } = await pipeline
    .resize({ height: ALTO_MAX, withoutEnlargement: true })
    .webp({ quality: CALIDAD })
    .toFile(destino)

  totalKB += size / 1024
  cars.push({
    id: modelo.id,
    name: modelo.name,
    serie: modelo.serie,
    qty: modelo.qty,
    price: modelo.price ?? PRECIO_BASE,
    img: `img/${modelo.id}.webp`
  })
  console.log(`  ${modelo.name} -> img/${modelo.id}.webp (${Math.round(size / 1024)} KB)`)
}

await writeFile(path.join(ROOT, 'cars.json'), JSON.stringify(cars, null, 2) + '\n', 'utf8')

// Las fotos originales salen de la raiz para que Vercel no las publique
let movidas = 0
for (const nombre of await readdir(ROOT)) {
  if (!/\.jpe?g$/i.test(nombre)) continue
  await rename(path.join(ROOT, nombre), path.join(ORIGINALES, nombre))
  movidas++
}

console.log(`\n${cars.length} modelos - ${cars.reduce((a, c) => a + c.qty, 0)} unidades`)
console.log(`img/ pesa ${Math.round(totalKB)} KB`)
console.log(`${movidas} fotos originales movidas a originales/`)
