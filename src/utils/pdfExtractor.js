import * as pdfjsLib from 'pdfjs-dist';

// Configuración recomendada para inicializar el Worker de PDF.js en entornos Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

/**
 * Reconstruye las líneas de una página agrupando los fragmentos de texto
 * por su coordenada Y. El `join(' ')` plano anterior mezclaba columnas y
 * perdía los saltos de línea, lo que arruinaba la detección de secciones
 * y de logros del CV.
 */
function buildLines(textContent) {
  const items = (textContent.items || []).filter(
    (item) => item && typeof item.str === 'string' && item.str.trim().length,
  );
  if (!items.length) return [];

  const rows = [];

  for (const item of items) {
    const x = Number(item.transform?.[4] ?? 0);
    const y = Number(item.transform?.[5] ?? 0);
    const height = Math.abs(Number(item.transform?.[3] ?? item.height ?? 10)) || 10;

    let row = rows.find((candidate) => Math.abs(candidate.y - y) <= Math.max(2.5, height * 0.32));
    if (!row) {
      row = { y, height, items: [] };
      rows.push(row);
    }
    row.height = Math.max(row.height, height);
    row.items.push({ x, str: item.str, width: Number(item.width || 0) });
  }

  // En PDF las Y crecen hacia arriba: la primera fila es la de mayor Y.
  rows.sort((a, b) => b.y - a.y);

  return rows
    .map((row) => {
      const sorted = [...row.items].sort((a, b) => a.x - b.x);
      let line = '';
      let previousEnd = null;

      for (const fragment of sorted) {
        if (previousEnd !== null) {
          const gap = fragment.x - previousEnd;
          if (gap > row.height * 2.2) line += '    ';
          else if (gap > 1.2) line += ' ';
        }
        line += fragment.str;
        previousEnd = fragment.x + fragment.width;
      }

      return line
        .replace(/\u00a0/g, ' ')
        .replace(/[ \t]+$/g, '')
        .trim();
    })
    .filter(Boolean);
}

function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, '  ')
    .trim();
}

export async function extractTextFromPDF(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    useSystemFonts: true,
  }).promise;

  const pages = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const lines = buildLines(textContent);
    if (lines.length) pages.push(lines.join('\n'));
  }

  const text = cleanText(pages.join('\n\n'));

  if (!text) {
    throw new Error(
      'No se pudo extraer texto del PDF. Puede ser un PDF escaneado o una imagen: pega el texto manualmente.',
    );
  }

  return text;
}
