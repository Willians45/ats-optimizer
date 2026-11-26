import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { SECTION_LABELS } from '../utils/cvData';
import { getAccent, getTemplate } from '../theme/templates';

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasItems(value) {
  return Array.isArray(value) && value.length > 0;
}

export default function CVDocument({
  data,
  template = 'classic',
  accent = 'purple',
  language = 'es',
}) {
  const t = getTemplate(template);
  const a = getAccent(accent);
  const s = t.pdf;
  const labels = SECTION_LABELS[language] || SECTION_LABELS.es;
  const personal = data?.datosPersonales || {};
  const meta = data?.meta || {};
  const order = Array.isArray(meta.ordenSecciones) && meta.ordenSecciones.length
    ? meta.ordenSecciones
    : ['perfilProfesional', 'experiencia', 'educacion', 'habilidades', 'proyectos', 'certificaciones', 'idiomas', 'premios'];
  const visibility = meta.secciones || {};

  const contactParts = [
    personal.email,
    personal.telefono,
    personal.ubicacion,
    personal.linkedin,
    personal.portafolio,
  ].filter(hasText);

  const styles = StyleSheet.create({
    page: {
      padding: s.padding,
      fontFamily: s.fontFamily,
      fontSize: s.bodySize,
      lineHeight: s.lineHeight,
      color: '#111827',
    },
    header: {
      marginBottom: s.sectionGap,
    },
    name: {
      fontSize: s.nameSize,
      fontWeight: 'bold',
      color: a.value,
      letterSpacing: -0.3,
      marginBottom: 3,
    },
    headline: {
      fontSize: s.headlineSize,
      fontWeight: 'bold',
      color: '#374151',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 7,
    },
    contact: {
      fontSize: s.bodySize - 0.5,
      color: '#4B5563',
    },
    section: {
      marginBottom: s.sectionGap,
    },
    heading: {
      fontSize: s.headingSize,
      fontWeight: 'bold',
      color: s.headingStyle === 'accent' ? a.value : '#111827',
      textTransform: s.uppercaseHeadings ? 'uppercase' : 'none',
      letterSpacing: 0.7,
      paddingBottom: 3,
      marginBottom: 6,
      borderBottomWidth: 1,
      borderBottomColor: s.headingStyle === 'accent' ? a.value : '#D1D5DB',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    bold: {
      fontWeight: 'bold',
    },
    italic: {
      fontStyle: 'italic',
    },
    muted: {
      color: '#6B7280',
    },
    entry: {
      marginBottom: 9,
    },
    entryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    entryTitle: {
      fontWeight: 'bold',
      flex: 1,
    },
    entryDate: {
      color: '#4B5563',
      fontSize: s.bodySize - 0.5,
      textAlign: 'right',
    },
    entrySub: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 3,
    },
    entrySubLeft: {
      fontStyle: 'italic',
      color: '#374151',
      flex: 1,
    },
    bulletRow: {
      flexDirection: 'row',
      marginBottom: 2,
      paddingLeft: 2,
    },
    bullet: {
      width: 10,
      color: a.value,
    },
    bulletText: {
      flex: 1,
    },
    paragraph: {
      color: '#1F2937',
    },
    skillLine: {
      marginBottom: 2,
    },
    small: {
      fontSize: s.bodySize - 0.7,
      color: '#4B5563',
    },
  });

  const renderSection = (key) => {
    if (visibility[key] === false) return null;

    if (key === 'perfilProfesional') {
      if (!hasText(data?.perfilProfesional)) return null;
      return (
        <View style={styles.section} key={key}>
          <Text style={styles.heading}>{labels.perfilProfesional}</Text>
          <Text style={styles.paragraph}>{data.perfilProfesional}</Text>
        </View>
      );
    }

    if (key === 'experiencia') {
      if (!hasItems(data?.experiencia)) return null;
      return (
        <View style={styles.section} key={key}>
          <Text style={styles.heading}>{labels.experiencia}</Text>
          {data.experiencia.map((item, index) => (
            <View style={styles.entry} key={item.id || index} wrap={false}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{item.cargo}</Text>
                {hasText(item.fechas) ? <Text style={styles.entryDate}>{item.fechas}</Text> : null}
              </View>
              <View style={styles.entrySub}>
                <Text style={styles.entrySubLeft}>
                  {[item.empresa, item.ubicacion].filter(hasText).join(' · ')}
                </Text>
              </View>
              {(item.logros || []).map((logro, i) => (
                <View style={styles.bulletRow} key={`${item.id || index}_${i}`}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{logro}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      );
    }

    if (key === 'educacion') {
      if (!hasItems(data?.educacion)) return null;
      return (
        <View style={styles.section} key={key}>
          <Text style={styles.heading}>{labels.educacion}</Text>
          {data.educacion.map((item, index) => (
            <View style={styles.entry} key={item.id || index} wrap={false}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{item.titulo}</Text>
                {hasText(item.fecha) ? <Text style={styles.entryDate}>{item.fecha}</Text> : null}
              </View>
              <View style={styles.entrySub}>
                <Text style={styles.entrySubLeft}>
                  {[item.institucion, item.ubicacion].filter(hasText).join(' · ')}
                </Text>
              </View>
              {hasText(item.detalles) ? <Text style={styles.small}>{item.detalles}</Text> : null}
            </View>
          ))}
        </View>
      );
    }

    if (key === 'habilidades') {
      const technical = data?.habilidades?.tecnicas || [];
      const soft = data?.habilidades?.blandas || [];
      if (!technical.length && !soft.length) return null;
      return (
        <View style={styles.section} key={key}>
          <Text style={styles.heading}>{labels.habilidades}</Text>
          {technical.length ? (
            <Text style={styles.skillLine}>
              <Text style={styles.bold}>Técnicas: </Text>
              {technical.join(' • ')}
            </Text>
          ) : null}
          {soft.length ? (
            <Text style={styles.skillLine}>
              <Text style={styles.bold}>Blandas: </Text>
              {soft.join(' • ')}
            </Text>
          ) : null}
        </View>
      );
    }

    if (key === 'proyectos') {
      if (!hasItems(data?.proyectos)) return null;
      return (
        <View style={styles.section} key={key}>
          <Text style={styles.heading}>{labels.proyectos}</Text>
          {data.proyectos.map((item, index) => (
            <View style={styles.entry} key={item.id || index} wrap={false}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{item.nombre}</Text>
                {hasText(item.fechas) ? <Text style={styles.entryDate}>{item.fechas}</Text> : null}
              </View>
              {hasText(item.rol) ? <Text style={styles.entrySubLeft}>{item.rol}</Text> : null}
              {hasText(item.descripcion) ? <Text style={styles.small}>{item.descripcion}</Text> : null}
              {hasText(item.enlace) ? <Text style={styles.small}>{item.enlace}</Text> : null}
            </View>
          ))}
        </View>
      );
    }

    if (key === 'certificaciones') {
      if (!hasItems(data?.certificaciones)) return null;
      return (
        <View style={styles.section} key={key}>
          <Text style={styles.heading}>{labels.certificaciones}</Text>
          {data.certificaciones.map((item, index) => (
            <View style={styles.row} key={item.id || index}>
              <Text style={styles.skillLine}>
                <Text style={styles.bold}>{item.nombre}</Text>
                {hasText(item.emisor) ? ` — ${item.emisor}` : ''}
              </Text>
              {hasText(item.fecha) ? <Text style={styles.entryDate}>{item.fecha}</Text> : null}
            </View>
          ))}
        </View>
      );
    }

    if (key === 'idiomas') {
      if (!hasItems(data?.idiomas)) return null;
      return (
        <View style={styles.section} key={key}>
          <Text style={styles.heading}>{labels.idiomas}</Text>
          <Text>
            {data.idiomas
              .map((item) => [item.idioma, item.nivel].filter(hasText).join(' — '))
              .filter(Boolean)
              .join('   •   ')}
          </Text>
        </View>
      );
    }

    if (key === 'premios') {
      if (!hasItems(data?.premios)) return null;
      return (
        <View style={styles.section} key={key}>
          <Text style={styles.heading}>{labels.premios}</Text>
          {data.premios.map((item, index) => (
            <View style={styles.row} key={item.id || index}>
              <Text style={styles.skillLine}>
                <Text style={styles.bold}>{item.titulo}</Text>
                {hasText(item.emisor) ? ` — ${item.emisor}` : ''}
              </Text>
              {hasText(item.fecha) ? <Text style={styles.entryDate}>{item.fecha}</Text> : null}
            </View>
          ))}
        </View>
      );
    }

    return null;
  };

  return (
    <Document
      title={`${personal.nombre || 'CV'}${personal.headline ? ` - ${personal.headline}` : ''}`}
      author={personal.nombre || ''}
      subject="CV optimizado para ATS"
      creator="CV Studio"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {hasText(personal.nombre) ? <Text style={styles.name}>{personal.nombre}</Text> : null}
          {hasText(personal.headline) ? <Text style={styles.headline}>{personal.headline}</Text> : null}
          {contactParts.length ? <Text style={styles.contact}>{contactParts.join('   |   ')}</Text> : null}
        </View>
        {order.map((key) => renderSection(key))}
      </Page>
    </Document>
  );
}
