/* Catálogo Hot Wheels — landing para separar carritos por WhatsApp.
   Para cambiar el número o la dirección, edita solo estas líneas. */
const WHATSAPP = '51959808052';   // con código de país, sin + ni espacios
// PRECIOS OCULTOS: se retiraron de la página. Para volver a mostrarlos, descomenta
// los bloques marcados con "PRECIOS OCULTOS" (app.js, index.html y styles.css).
// const PRECIO = 17;                // precio normal; un modelo puede traer su propio "price" en cars.json
const DIRECCION = 'Solari Plaza 1079';

// PRECIOS OCULTOS
// const precioDe = (carro) => carro.price ?? PRECIO;
// const soles = (monto) => `S/ ${monto}`;

const CLAVE_GUARDADO = 'hw-seleccion';

const $ = (sel) => document.querySelector(sel);

const grilla = $('#grilla');
const estado = $('#estado');
const sinResultados = $('#sin-resultados');
const buscador = $('#buscador');
const barra = $('#barra');
const resumenCantidad = $('#resumen-cantidad');
// PRECIOS OCULTOS
// const resumenTotal = $('#resumen-total');
const btnWhatsapp = $('#btn-whatsapp');
const btnLimpiar = $('#limpiar');
const visor = $('#visor');
const visorImg = $('#visor-img');
const visorNombre = $('#visor-nombre');

let carros = [];
const seleccion = new Set(leerGuardado());

/* ---------- Guardado local (tolera navegadores que lo bloquean) ---------- */

function leerGuardado () {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_GUARDADO)) || [];
  } catch {
    return [];
  }
}

function guardar () {
  try {
    localStorage.setItem(CLAVE_GUARDADO, JSON.stringify([...seleccion]));
  } catch {
    /* modo incógnito o almacenamiento bloqueado: seguimos sin guardar */
  }
}

/* ---------- Carga del catálogo ---------- */

async function cargar () {
  try {
    const respuesta = await fetch('cars.json');
    if (!respuesta.ok) throw new Error(respuesta.status);
    carros = await respuesta.json();
  } catch {
    estado.textContent = 'No pudimos cargar el catálogo. Revisa tu conexión y vuelve a intentar.';
    return;
  }

  // Descarta selecciones guardadas de modelos que ya no están
  const ids = new Set(carros.map((c) => c.id));
  [...seleccion].forEach((id) => { if (!ids.has(id)) seleccion.delete(id); });

  $('#chip-total-modelos').textContent = `${carros.length} modelos distintos`;
  estado.hidden = true;
  grilla.hidden = false;
  pintar(carros);
  actualizarBarra();
}

/* ---------- Pintado ---------- */

function pintar (lista) {
  grilla.textContent = '';
  const fragmento = document.createDocumentFragment();

  for (const carro of lista) {
    const item = document.createElement('li');
    item.className = 'tarjeta';
    item.dataset.id = carro.id;
    if (seleccion.has(carro.id)) item.classList.add('activa');

    const foto = document.createElement('button');
    foto.type = 'button';
    foto.className = 'tarjeta__foto';
    foto.setAttribute('aria-label', `Ver foto de ${carro.name}`);

    const img = document.createElement('img');
    img.src = carro.img;
    img.alt = `Hot Wheels ${carro.name} en su blíster`;
    img.loading = 'lazy';
    img.decoding = 'async';
    foto.append(img);

    if (carro.qty > 1) {
      const etiqueta = document.createElement('span');
      etiqueta.className = 'etiqueta-stock';
      etiqueta.textContent = `${carro.qty} disponibles`;
      foto.append(etiqueta);
    }

    if (carro.version) {
      const version = document.createElement('span');
      version.className = 'etiqueta-version';
      version.textContent = carro.version;
      foto.append(version);
    }

    const cuerpo = document.createElement('div');
    cuerpo.className = 'tarjeta__cuerpo';

    const nombre = document.createElement('h2');
    nombre.className = 'tarjeta__nombre';
    nombre.textContent = carro.name;

    // PRECIOS OCULTOS
    // const precio = document.createElement('p');
    // precio.className = 'tarjeta__precio';
    // precio.textContent = soles(precioDe(carro));

    cuerpo.append(nombre);

    if (carro.serie) {
      const serie = document.createElement('span');
      serie.className = 'tarjeta__serie';
      serie.textContent = carro.serie;
      cuerpo.append(serie);
    }

    // PRECIOS OCULTOS
    // cuerpo.append(precio);

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'tarjeta__btn';
    boton.dataset.accion = 'seleccionar';
    boton.setAttribute('aria-pressed', String(seleccion.has(carro.id)));
    boton.textContent = seleccion.has(carro.id) ? '✓ Seleccionado' : 'Separar';

    item.append(foto, cuerpo, boton);
    fragmento.append(item);
  }

  grilla.append(fragmento);
}

/* ---------- Selección ---------- */

function alternar (id) {
  if (seleccion.has(id)) seleccion.delete(id);
  else seleccion.add(id);
  guardar();

  const tarjeta = grilla.querySelector(`.tarjeta[data-id="${CSS.escape(id)}"]`);
  if (tarjeta) {
    const activa = seleccion.has(id);
    const boton = tarjeta.querySelector('.tarjeta__btn');
    tarjeta.classList.toggle('activa', activa);
    boton.textContent = activa ? '✓ Seleccionado' : 'Separar';
    boton.setAttribute('aria-pressed', String(activa));
  }

  actualizarBarra();
}

function seleccionados () {
  return carros.filter((c) => seleccion.has(c.id));
}

function actualizarBarra () {
  const elegidos = seleccionados();
  barra.hidden = elegidos.length === 0;
  if (!elegidos.length) return;

  resumenCantidad.textContent =
    elegidos.length === 1 ? '1 carrito seleccionado' : `${elegidos.length} carritos seleccionados`;
  // PRECIOS OCULTOS
  // resumenTotal.textContent = `Total ${soles(total(elegidos))}`;
  btnWhatsapp.href = enlaceWhatsapp(elegidos);
}

// PRECIOS OCULTOS
// function total (elegidos) {
//   return elegidos.reduce((suma, carro) => suma + precioDe(carro), 0);
// }

function enlaceWhatsapp (elegidos) {
  const lineas = [
    '¡Hola! Quiero separar estos Hot Wheels:',
    '',
    // PRECIOS OCULTOS
    // ...elegidos.map((c) => `• ${c.name} — ${soles(precioDe(c))}`),
    ...elegidos.map((c) => `• ${c.name}`),
    '',
    // PRECIOS OCULTOS
    // `Total: ${soles(total(elegidos))} (${elegidos.length} ${elegidos.length === 1 ? 'carrito' : 'carritos'})`,
    `${elegidos.length} ${elegidos.length === 1 ? 'carrito' : 'carritos'}`,
    `Recojo en ${DIRECCION}.`
  ];
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lineas.join('\n'))}`;
}

/* ---------- Buscador ---------- */

function normalizar (texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function filtrar () {
  const termino = normalizar(buscador.value.trim());
  const lista = termino
    ? carros.filter((c) => normalizar(`${c.name} ${c.serie || ''} ${c.version || ''}`).includes(termino))
    : carros;

  pintar(lista);
  grilla.hidden = lista.length === 0;
  sinResultados.hidden = lista.length > 0;
}

/* ---------- Visor de foto ---------- */

function abrirVisor (carro) {
  visorImg.src = carro.img;
  visorImg.alt = `Hot Wheels ${carro.name} en su blíster`;
  // PRECIOS OCULTOS
  // visorNombre.textContent = `${carro.name} — ${soles(precioDe(carro))}`;
  visorNombre.textContent = carro.name;
  visor.hidden = false;
  document.body.style.overflow = 'hidden';
}

function cerrarVisor () {
  visor.hidden = true;
  visorImg.src = '';
  document.body.style.overflow = '';
}

/* ---------- Eventos ---------- */

grilla.addEventListener('click', (evento) => {
  const tarjeta = evento.target.closest('.tarjeta');
  if (!tarjeta) return;

  if (evento.target.closest('.tarjeta__foto')) {
    const carro = carros.find((c) => c.id === tarjeta.dataset.id);
    if (carro) abrirVisor(carro);
    return;
  }

  if (evento.target.closest('[data-accion="seleccionar"]')) {
    alternar(tarjeta.dataset.id);
  }
});

btnLimpiar.addEventListener('click', () => {
  seleccion.clear();
  guardar();
  filtrar();
  actualizarBarra();
});

buscador.addEventListener('input', filtrar);

$('#visor-cerrar').addEventListener('click', cerrarVisor);
visor.addEventListener('click', (evento) => {
  if (evento.target === visor) cerrarVisor();
});
document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape' && !visor.hidden) cerrarVisor();
});

cargar();
