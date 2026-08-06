# FocusFlow — Prototipo de clasificación de correos

Prototipo web funcional que reproduce la tarea de clasificación de correos de
una aplicación de escritorio virtual, para validar la experiencia de
interacción y la estructura de la tarea antes de implementarla en Unity.

La tarea combina dos paradigmas: una bandeja de entrada de correo simulada
(tres columnas, drag and drop) sobre una estructura de bloques inspirada en
el Berg's Card Sorting Test — el criterio de clasificación cambia sin aviso
cada bloque y el participante debe inferir el cambio a partir del feedback
de error.

Este prototipo corre enteramente en el cliente: no hay backend ni
persistencia en base de datos. Los datos de la sesión se acumulan en memoria
y se exportan a CSV al finalizar.

## Instalación y ejecución

Requisitos: Node.js 20 o superior.

```bash
npm install
npm run dev
```

Esto levanta un servidor de desarrollo (Vite) en `http://localhost:5173`.
Abrí esa URL en el navegador; la sesión se controla enteramente con mouse
(drag and drop) desde ahí.

Otros comandos disponibles:

```bash
npm run build     # build de producción a dist/
npm run preview   # sirve el build de producción localmente
npm run lint      # linting con oxlint
```

## Cómo correr la sesión

1. Pantalla de inicio: permite fijar la duración (en minutos) de cada uno de
   los 3 bloques antes de arrancar → botón **Comenzar**.
2. Bloque 1: llega un correo automáticamente y se abre solo. A partir de ahí
   llegan 7 correos más, repartidos en partes iguales a lo largo de la
   duración configurada para ese bloque. El correo abierto es arrastrable a
   cualquiera de las 4 carpetas de la pestaña activa (columna derecha). Se
   puede cambiar de pestaña (Fecha / Prioridad / Departamento) en cualquier
   momento. Un timer arriba a la derecha muestra cuánto tiempo lleva
   transcurrido de la sesión.
3. Al agotarse la duración del bloque, este termina y —sin ningún aviso—
   arranca el siguiente con un criterio de clasificación distinto. Los
   correos que quedaron sin clasificar NO desaparecen: siguen en la bandeja
   y pasan a evaluarse contra el nuevo criterio vigente (cada correo del
   corpus ya tiene asignada su categoría correcta bajo los tres criterios a
   la vez). La pestaña seleccionada tampoco se reinicia entre bloques.
4. Al terminar los 3 bloques se muestra un resumen de la sesión con un botón
   para descargar el CSV con el registro completo de eventos. Recién ahí se
   registran como `no_clasificado` los correos que nunca se llegaron a
   clasificar.

## Dónde se ajusta cada parámetro de la tarea

Toda la parametrización de la tarea vive en `src/config/` y `src/domain/`.
Ningún componente de `src/components/` contiene valores de temporización,
nombres de categorías ni reglas de validación — cambiar cualquiera de estos
parámetros implica editar únicamente el archivo correspondiente.

| Querés cambiar... | Editá... |
|---|---|
| Duración por defecto de un bloque (minutos) | `duracionBloqueMinDefault` en [`src/config/session.config.ts`](src/config/session.config.ts) — editable por bloque desde la pantalla de inicio en tiempo de ejecución |
| Intervalo entre llegadas de correos | No se configura directamente: se recalcula como `duración del bloque / correosPorBloque`, así siempre respeta los minutos configurados |
| Cantidad de correos por bloque | `correosPorBloque` (también determina cuántos correos de cada `CORPUS_POR_BLOQUE` se usan) |
| Duración de la pausa entre bloques | `pausaEntreBloquesMs` |
| Orden de los criterios a lo largo de los bloques | `ordenCriterios` |
| Identificador de participante por defecto | `participanteDefault` |
| Fecha ancla contra la que está redactado el corpus | `anclaCorpusISO` — ver [`src/domain/fechaCorreo.ts`](src/domain/fechaCorreo.ts): en tiempo de ejecución cada fecha de correo se reproyecta contra `fechaReferenciaSesion` (hoy) para que la bandeja siempre luzca actual |
| Frecuencia de refresco del reloj interno de la sesión | `TICK_INTERVALO_MS` |
| Rótulos, íconos o categorías de un criterio | [`src/config/criteria.config.ts`](src/config/criteria.config.ts) — `CRITERIOS` |
| Contenido del corpus (remitente, asunto, cuerpo, clasificación, adjunto) | [`src/config/corpus.ts`](src/config/corpus.ts) — `CORPUS_POR_BLOQUE`. Las fechas se escriben contra `anclaCorpusISO` (ver arriba), no contra la fecha real |
| Regla de qué hace correcta una clasificación | [`src/domain/classification.ts`](src/domain/classification.ts) — `evaluarClasificacion` (no debería necesitar cambios; es la lógica del paradigma) |
| Columnas o formato del CSV exportado | [`src/logging/csvExporter.ts`](src/logging/csvExporter.ts) |

Si se agrega una categoría a un criterio, agregar también un ícono válido en
`ICONOS` dentro de [`src/components/folders/iconRegistry.tsx`](src/components/folders/iconRegistry.tsx)
(usa nombres de [lucide-react](https://lucide.dev/icons/)).

Si se agregan o quitan correos del corpus, cada `Email` requiere las tres
claves de `clasificacion` (`fecha`, `prioridad`, `departamento`) con un id de
categoría válido para ese criterio — el tipo `Email` en
[`src/domain/types.ts`](src/domain/types.ts) lo exige en tiempo de
compilación.

## Estructura del proyecto

```
src/
  config/            Parametrización de la tarea (temporización, criterios, corpus)
  domain/            Tipos y lógica pura de clasificación (sin UI, sin estado)
  engine/            Hooks de estado: máquina de estados de la sesión y bandeja
  logging/           Registro de eventos en memoria y exportación a CSV
  components/
    layout/          Encabezado y grilla de tres columnas
    inbox/           Bandeja de entrada y sus ítems (drag source)
    reader/          Columna de lectura del correo abierto
    folders/         Pestañas de criterio y carpetas (drop targets)
    feedback/        Toast de error de clasificación
    screens/         Pantalla de inicio y pantalla de resumen
  App.tsx            Composición: conecta engine + bandeja + registro + UI
```

## Registro de eventos (CSV)

Cada intento de clasificación (correcto o no) genera una fila. Los correos
que nunca se llegaron a clasificar en toda la sesión generan una fila propia
al finalizar el último bloque, con `tipo_error = no_clasificado` y los
campos de drop vacíos (mientras la sesión sigue corriendo, un correo sin
clasificar permanece en la bandeja y puede reintentarse bajo el criterio del
bloque que esté vigente en ese momento). Los timestamps (`t_llegada_ms`,
`t_primera_apertura_ms`, `t_drop_ms`, `tiempo_reaccion_ms`) están en
milisegundos relativos al inicio de la sesión; `timestamp_iso` es además un
timestamp absoluto ISO 8601 por evento.

`tipo_error` distingue `ninguno` / `categoria_incorrecta` (pestaña correcta,
carpeta incorrecta) / `criterio_incorrecto` (pestaña equivocada) /
`no_clasificado` (nunca clasificado en toda la sesión) — esta distinción es
la que permite ver si el participante persiste en el criterio del bloque
anterior después de un cambio.

## Fuera de alcance en esta versión

Por diseño, no incluye: estímulos distractores, pantalla de instrucciones,
captura de identificador de participante, ni persistencia en backend. El
modelo de datos (`participante` fijo en `SESSION_CONFIG.participanteDefault`)
ya está preparado para incorporar una pantalla de ingreso de identificador
más adelante sin cambios estructurales.
