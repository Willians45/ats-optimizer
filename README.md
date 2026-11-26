# CV Studio · Optimizador de CV para ATS

Aplicación web para crear, adaptar y descargar currículums optimizados para sistemas **ATS (Applicant Tracking Systems)**. La interfaz está inspirada en editores visuales tipo Canva: eliges una plantilla, editas el documento directamente sobre la hoja y ves el análisis ATS en tiempo real.

> La IA no inventa datos personales, empresas, cargos, fechas ni métricas. Reescribe y prioriza la información real del CV para acercarla al puesto objetivo.

## ✨ Qué incluye

- **Editor visual inline**: haz clic sobre cualquier texto de la hoja para editarlo. Añade, duplica, elimina y reordena experiencias, logros, secciones y habilidades sin formularios.
- **Cargo objetivo claro**: la app pide el puesto (ej. *Recepcionista*, *Desarrollador Frontend*) y adapta el headline, el perfil y las keywords a ese contexto.
- **Plantillas ATS-safe**: `Clásica`, `Moderna`, `Compacta` y `Ejecutiva`, siempre de una sola columna, sin tablas, iconos ni gráficos.
- **Análisis ATS determinista**: score calculado en el navegador con reglas de keywords, formato, logros y métricas. No lo inventa el modelo.
- **Extracción de PDF mejorada**: reconstruye líneas y columnas a partir de las coordenadas del PDF en lugar de unir todo el texto en una sola línea.
- **Optimización con Gemini**: proxy serverless con validación, normalización de la respuesta JSON y errores claros.
- **BYOK opcional**: si no quieres configurar una key en el servidor, puedes pegar la tuya en **Ajustes**; se guarda solo en tu navegador.
- **Exportación PDF** con `@react-pdf/renderer`, generada bajo demanda.
- **Autoguardado local** del CV, contexto, borradores e historial de deshacer/rehacer (`Ctrl+Z` / `Ctrl+Shift+Z`).

## 🏗️ Arquitectura

```text
React + Vite (navegador)
        │
        │  POST /api/gemini  (nunca la API key en el bundle)
        ▼
Proxy serverless (Vercel Function / plugin de Vite en dev)
        │  GEMINI_API_KEY (variable de servidor)
        ▼
Google Gemini API
```

- En producción, `/api/gemini` se ejecuta como Vercel Function (`api/gemini.js`).
- En desarrollo, el mismo handler se monta como middleware de Vite (`vite.config.js`), así que `npm run dev` funciona sin `vercel dev`.
- La app **nunca** lee `GEMINI_API_KEY` desde el cliente. La key del servidor no se expone.
- Si el usuario configura su propia key (BYOK), el navegador la envía al proxy en cada petición y el proxy la usa solo para esa llamada.

## 🛠️ Tecnologías

- React 19 + Vite 8
- Tailwind CSS 4
- `@google/genai` (SDK oficial de Gemini)
- Zod para validación de entrada
- `@react-pdf/renderer` + `pdfjs-dist`
- Framer Motion y Lucide React

## 🚀 Ejecutar en local

Requisitos: Node.js 20.19+ (o 22.12+) y una API key de Gemini ([Google AI Studio](https://aistudio.google.com/app/apikey)).

```bash
npm install
```

Crea un `.env` en la raíz a partir de `.env.example`:

```bash
cp .env.example .env
```

Edita `.env`:

```env
GEMINI_API_KEY=tu_api_key_real
GEMINI_MODEL=gemini-3.8-flash
```

> ⚠️ No uses el prefijo `VITE_` para `GEMINI_API_KEY`. Las variables `VITE_*` se incrustan en el JavaScript público y cualquiera puede leerlas.

Arranca el proyecto:

```bash
npm run dev
```

Abre la URL que indique Vite (normalmente `http://localhost:5173`).

### Alternativa sin `.env`: BYOK

1. Abre **Ajustes** en la barra superior o en el rail izquierdo.
2. Pega tu API key de Gemini.
3. Pulsa **Probar conexión** y luego **Guardar**.

La key se guarda en `localStorage` de ese navegador y solo se envía a tu propio proxy `/api/gemini`.

## ☁️ Desplegar en Vercel

1. Importa el repositorio en Vercel.
2. En **Settings → Environment Variables**, añade:
   - `GEMINI_API_KEY` = tu key real (entorno Production, Preview y Development).
   - `GEMINI_MODEL` = `gemini-3.8-flash` (opcional).
3. Despliega. Vercel detecta Vite y la función `api/gemini.js` automáticamente.

`vercel.json` ya configura:

- `maxDuration: 60` para la función de Gemini.
- Cabeceras de seguridad básicas (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).

### Rotar una key expuesta

Si alguna vez se publicó una key en el repositorio, historial o un archivo `.env` compartido, **revócala en Google AI Studio** y genera una nueva. Este proyecto no contiene keys reales: solo placeholders en `.env.example`.

## 🤖 Modelos

Modelos permitidos por el proxy:

| Modelo | Uso recomendado |
| --- | --- |
| `gemini-3.8-flash` | Equilibrio calidad/velocidad (por defecto) |
| `gemini-4-hydrogen` | Máxima calidad de redacción |
| `gemini-3.5-flash-lite` | Respuestas más económicas |

El modelo se puede cambiar en **Ajustes**. El servidor valida que el modelo solicitado esté en la lista permitida; si no, usa `GEMINI_MODEL` o el valor por defecto.

## 📁 Estructura del proyecto

```text
api/gemini.js              Vercel Function
server/geminiHandler.js    Proxy: validación, rate limit, SDK, errores
server/cvNormalize.js      Normalización de la respuesta del modelo
server/prompts/            Prompt de optimización
shared/cvSchema.js         Contrato JSON y modelos permitidos
src/components/layout/     TopBar, rail, paneles, canvas, inspector
src/components/panels/     Contenido, Diseño, IA, ATS
src/components/editor/     Editor inline sobre la hoja A4
src/components/ui/         Botones, inputs, modales, toasts, score ring
src/context/CvContext.jsx  Estado global, historial y autoguardado
src/hooks/                 Generación, análisis ATS y estado de la API
src/services/              Cliente del proxy y motor ATS
src/pdf/                   Documento PDF y botón de descarga
src/theme/templates.js     Plantillas y colores de acento
src/utils/                 PDF, keywords, normalización y storage
```

## 🧪 Scripts

```bash
npm run dev      # desarrollo con proxy de Gemini
npm run build    # build de producción
npm run preview  # previsualizar el build
npm run lint     # ESLint
```

## 🔐 Notas de seguridad y privacidad

- La API key del servidor vive solo en variables de entorno de Vercel.
- El proxy aplica un rate limit en memoria de 12 peticiones por minuto por IP.
- Los mensajes de error del proveedor se sanean antes de devolverlos al cliente.
- El CV, el contexto y la key BYOK se guardan en `localStorage`; no hay base de datos ni cuentas de usuario.
- Al descargar el PDF, la generación ocurre en el navegador con los datos locales.

## 🎯 Decisiones de diseño ATS

- Una sola columna y fuentes estándar (`Helvetica` / `Times-Roman` en PDF).
- Encabezados de sección convencionales y texto seleccionable.
- Sin tablas, cajas de texto, iconos, gráficos ni imágenes en el cuerpo del CV.
- El score prioriza: cobertura de keywords (50%), título/cargo objetivo (15%), formato y estructura (20%) y logros cuantificados (15%).
- Las keywords se extraen de la oferta y del cargo objetivo; si no hay oferta, se usan las habilidades y el contexto del CV.

## ❓ Problemas frecuentes

**“No hay API key configurada”.**  
Configura `GEMINI_API_KEY` en `.env` (local) o en Vercel (producción), o pega tu key en **Ajustes**.

**“La API key no es válida o caducó”.**  
Revisa la key en Google AI Studio. Si la rotaste, actualiza `.env`/Vercel y vuelve a probar.

**“El modelo no está disponible”.**  
Tu cuenta puede no tener acceso a ese modelo. Prueba `gemini-3.8-flash` en Ajustes.

**El PDF no extrae texto.**  
Puede ser un PDF escaneado (imagen). Pega el texto manualmente en el panel de Contenido.

**La captura de la oferta no se envía.**  
Vercel limita el cuerpo de las funciones a 4.5 MB. Usa una captura de menos de 3 MB.

---

Creado por [Willians45](https://github.com/Willians45).
