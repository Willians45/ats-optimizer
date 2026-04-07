import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Optimiza un CV usando Gemini 1.5 Flash.
 *
 * @param {string} cvText - Texto del CV original.
 * @param {string | object} jobData - Texto de la vacante, o un objeto con estructura inlineData para una imagen: 
 *                                    { inlineData: { data: "base64...", mimeType: "image/png" } }
 * @returns {Promise<Object>} JSON estructurado con el CV optimizado.
 */
export async function optimizeCV(cvText, jobData, targetLanguage = "es") {
  const apiKey = localStorage.getItem('gemini_api_key');
  
  if (!apiKey) {
    throw new Error("API Key no encontrada. Por favor configúrala en el panel lateral.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // En 2026, la familia 1.x y 2.x temprana ha sido depreciada.
  // Intentamos usar el alias 'gemini-flash-latest' que apunta siempre a la versión más reciente compatible.
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const promptText = `
Eres un experto "Resume Writer" enfocado en la optimización técnica de CVs para sistemas ATS. Tu objetivo es refinanciar el contenido para que sea legible y atractivo para los algoritmos sin comprometer la integridad de la información.

IDIOMA DE SALIDA: 
DEBES generar todo el contenido del JSON en **${targetLanguage === 'en' ? 'INGLÉS' : 'ESPAÑOL'}**, independientemente del idioma del CV original. Si el original está en español y el target es inglés, TRADUCE profesionalmente.

REGLAS DE IDENTIDAD E INTEGRIDAD (MÁXIMA PRIORIDAD):
1. **Identidad Intocable**: NUNCA inventes o cambies el nombre, correo, teléfono, LinkedIn o cualquier dato personal. Usa estrictamente los que aparecen en el "CV ORIGINAL". Si no aparecen, deja los campos vacíos o con marcadores realistas del original.
2. **Veracidad de Datos**: Mantén las empresas, cargos y fechas exactamente como están en el original. Tu tarea es mejorar la *redacción* de los logros, no inventar una carrera nueva.
3. **No Hallucination**: Si el usuario no provee una oferta de empleo, realiza una optimización técnica general enfocada en la claridad, el formato STAR y la jerarquía de información, pero NO inventes métricas ficticias si no hay base para ellas en el texto original.

METODOLOGÍA DE TRABAJO:
- Si hay una oferta (texto o imagen): Extrae las 5 keywords más críticas y re-enfoca los logros del candidato para resaltar esas habilidades, usando un lenguaje de impacto y métricas que sean coherentes con su rol real.
- Si NO hay oferta: Optimiza el formato general a un estándar ATS de alto rendimiento, traduciendo tareas pasivas a logros activos (STAR).

REGLAS DE REDACCIÓN:
- Usa verbos de acción fuertes.
- Maximiza el uso de keywords relevantes al sector.
- Estructura la experiencia en viñetas claras y concisas.

ESTRUCTURA DE RESPUESTA REQUERIDA (JSON ESTRICTO):
Devuelve ÚNICAMENTE un JSON válido siguiendo este esquema:

{
  "datosPersonales": {
    "nombre": "Nombre Real del CV",
    "contacto": "Email / Tel del CV"
  },
  "perfilProfesional": "Resumen ejecutivo potente de 3-4 líneas. Si hay oferta, inyecta keywords de la vacante. Si no, hazlo general del sector.",
  "experiencia": [
    {
      "cargo": "Cargos reales",
      "empresa": "Empresas reales",
      "fechas": "Fechas reales",
      "descripcionSTAR": "Logros impactantes en viñetas (* o -). Mejora la redacción usando el modelo STAR basado en los hechos del CV original."
    }
  ],
  "educacion": [
    {
      "titulo": "Título real",
      "institucion": "Institución real",
      "fecha": "Fecha real"
    }
  ],
  habilidades: ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"]
}

---
CV ORIGINAL DEL CANDIDATO:
${cvText}

${typeof jobData === 'string' ? `\n---\nINFO / REQUISITOS DE LA VACANTE:\n${jobData}` : 'Nota: El candidato adjuntó la oferta como imagen (incluida en el payload de este prompt). Reconoce el texto completo mediante visión artificial.'}
`;

  // Preparamos el contenido a enviar. Si jobData incluye una imagen, la agregamos.
  const inputContent = [promptText];
  if (typeof jobData === 'object' && jobData.inlineData) {
    inputContent.push(jobData);
  }

  const result = await model.generateContent(inputContent);
  const responseText = result.response.text();

  return JSON.parse(responseText);
}
