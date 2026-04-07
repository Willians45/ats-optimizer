# ATS CV Optimizer (100% Client-Side)

Una herramienta personal y potente diseñada para optimizar currículums (CV) para que superen con éxito los sistemas de filtrado automático **ATS (Applicant Tracking Systems)**. Construida con una estética de consola moderna y funcional.

## ✨ Características Principales

- **Privacidad Total**: Procesamiento 100% en el lado del cliente. Tus datos no se almacenan en servidores externos, solo viajan directamente a la API de Google Gemini.
- **Extracción de PDF**: Sube tu CV en formato PDF y extrae el texto plano automáticamente usando `pdfjs-dist`.
- **IA de Última Generación**: Utiliza **Google Gemini 3 Flash** (vía `gemini-flash-latest`) para analizar, extraer keywords críticas y reescribir tu experiencia laboral.
- **Formato STAR**: La IA reestructura tus logros laborales siguiendo la metodología **STAR** (Situación, Tarea, Acción, Resultado) con un enfoque en métricas y resultados.
- **Soporte Multilingüe**: Optimiza o traduce tu CV al **Inglés** o **Español** con un solo clic.
- **Previsualización en Tiempo Real**: Genera un PDF elegante y minimalista optimizado para ATS usando `@react-pdf/renderer` que se actualiza mientras editas.
- **OCR de Vacantes**: Puedes pegar el texto de una oferta laboral o subir una **captura de pantalla (imagen)** para que la IA extraiga los requerimientos mediante visión artificial.

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React + Vite
- **Estilos**: Tailwind CSS v4
- **IA**: @google/generative-ai (Gemini 3 Flash)
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React
- **PDF**: @react-pdf/renderer & pdfjs-dist

## 🚀 Cómo Ejecutar el Proyecto Localmente

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/Willians45/ats-optimizer.git
cd ats-optimizer
npm install
```

### 2. Configuración de API
- Abre la aplicación y haz clic en el botón **Settings** en el sidebar.
- Ingresa tu **API Key de Gemini** (puedes obtener una gratis en [Google AI Studio](https://aistudio.google.com/app/apikey)).
- La llave se guardará localmente en tu navegador (`localStorage`).

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible usualmente en `http://localhost:5173`.

## 📄 Notas de Diseño
El diseño del PDF generado es **estrictamente de una sola columna** y utiliza fuentes estándar. Esto es intencional para maximizar la compatibilidad con todos los parsers de ATS del mercado (como Workday, Taleo, Greenhouse), los cuales suelen fallar al leer diseños de dos columnas o con gráficos complejos.

---
Creado por [Willians45](https://github.com/Willians45)
