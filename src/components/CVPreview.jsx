import { PDFViewer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { useDebounce } from 'use-debounce';
import { useCvContext } from '../context/CvContext';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, lineHeight: 1.4, color: '#000000' },
  section: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  contact: { fontSize: 10, textAlign: 'center', marginBottom: 20 },
  heading: { fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#000000', paddingBottom: 2, marginBottom: 8 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  boldText: { fontWeight: 'bold' },
  bulletPoint: { flexDirection: 'row', marginBottom: 3, paddingLeft: 8 },
  bulletSymbol: { width: 12 },
  bulletText: { flex: 1 }
});

const ATSDocument = ({ data, language = 'es' }) => {
  if (!data) return <Document><Page size="A4" style={styles.page}></Page></Document>;

  const labels = {
    es: {
      profile: "Perfil Profesional",
      experience: "Experiencia Profesional",
      education: "Educación",
      skills: "Habilidades Técnicas"
    },
    en: {
      profile: "Professional Summary",
      experience: "Professional Experience",
      education: "Education",
      skills: "Technical Skills"
    }
  }[language];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.title}>{data.datosPersonales?.nombre || ''}</Text>
          <Text style={styles.contact}>{data.datosPersonales?.contacto || ''}</Text>
        </View>

        {data.perfilProfesional && (
          <View style={styles.section}>
            <Text style={styles.heading}>{labels.profile}</Text>
            <Text>{data.perfilProfesional}</Text>
          </View>
        )}

        {data.experiencia && data.experiencia.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.heading}>{labels.experience}</Text>
            {data.experiencia.map((exp, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <View style={styles.jobHeader}>
                  <Text style={styles.boldText}>{exp.cargo}</Text>
                  <Text>{exp.fechas}</Text>
                </View>
                <Text style={{ fontStyle: 'italic', marginBottom: 4 }}>{exp.empresa}</Text>
                {exp.descripcionSTAR ? exp.descripcionSTAR.split('\n').filter(Boolean).map((bullet, idx) => (
                  <View key={idx} style={styles.bulletPoint}>
                    <Text style={styles.bulletSymbol}>•</Text>
                    <Text style={styles.bulletText}>{bullet.replace(/^[-•]/,'').trim()}</Text>
                  </View>
                )) : null}
              </View>
            ))}
          </View>
        )}

        {data.educacion && data.educacion.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.heading}>{labels.education}</Text>
            {data.educacion.map((edu, i) => (
              <View key={i} style={styles.jobHeader}>
                <Text><Text style={styles.boldText}>{edu.titulo}</Text>, {edu.institucion}</Text>
                <Text>{edu.fecha}</Text>
              </View>
            ))}
          </View>
        )}

        {data.habilidades && data.habilidades.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.heading}>{labels.skills}</Text>
            <Text>{data.habilidades.join(' • ')}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default function CVPreview() {
  const { optimizedData, language } = useCvContext();
  const [debouncedData] = useDebounce(optimizedData, 1000);

  if (!debouncedData) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        <p>Genera el CV para ver la previsualización del PDF en tiempo real.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-300">
      <PDFViewer width="100%" height="100%" showToolbar={true} className="border-none">
        <ATSDocument data={debouncedData} language={language} />
      </PDFViewer>
    </div>
  );
}
