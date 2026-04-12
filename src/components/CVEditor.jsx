import { useCvContext } from '../context/CvContext';

export default function CVEditor() {
  const { optimizedData, setOptimizedData, language } = useCvContext();

  if (!optimizedData) {
    return (
      <div className="p-4 text-center text-slate-400">
        No hay datos optimizados aún. Procesa el CV primero.
      </div>
    );
  }

  const labels = {
    es: {
      personal: "Datos Personales",
      profile: "Perfil Profesional",
      experience: "Experiencia (STAR)",
      education: "Educación",
      skills: "Habilidades",
      placeholders: {
        name: "Nombre completo",
        profession: "Profesión / Puesto (ej. Desarrollador Frontend)",
        contact: "Ej. email@... | Tel...",
        cargo: "Cargo",
        empresa: "Empresa",
        fechas: "Fechas",
        star: "Puntos en formato viñetas",
        titulo: "Título",
        institucion: "Institución",
        skills: "Skill 1, Skill 2, ..."
      }
    },
    en: {
      personal: "Personal Information",
      profile: "Professional Summary",
      experience: "Experience (STAR)",
      education: "Education",
      skills: "Skills",
      placeholders: {
        name: "Full Name",
        profession: "Profession / Role (e.g. Frontend Developer)",
        contact: "e.g. email@... | Tel...",
        cargo: "Job Title",
        empresa: "Company",
        fechas: "Dates",
        star: "Achievement bullets",
        titulo: "Degree / Title",
        institucion: "Institution",
        skills: "Skill 1, Skill 2, ..."
      }
    }
  }[language];

  const handleChange = (section, field, value, index = null) => {
    setOptimizedData(prev => {
      const next = { ...prev };
      if (index !== null) {
        next[section] = [...next[section]];
        next[section][index] = { ...next[section][index], [field]: value };
      } else if (field) {
        next[section] = { ...next[section], [field]: value };
      } else {
        next[section] = value;
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full text-sm pb-20">
      <section className="bg-slate-800 p-4 border border-slate-700 rounded-lg">
        <h3 className="text-slate-200 font-semibold mb-3">{labels.personal}</h3>
        <div className="flex flex-col gap-3">
          <input className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-md text-white focus:outline-none focus:border-blue-500" value={optimizedData.datosPersonales?.nombre || ""} onChange={e => handleChange('datosPersonales', 'nombre', e.target.value)} placeholder={labels.placeholders.name} />
          <input className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-md text-white focus:outline-none focus:border-blue-500" value={optimizedData.datosPersonales?.profesion || ""} onChange={e => handleChange('datosPersonales', 'profesion', e.target.value)} placeholder={labels.placeholders.profession} />
          <input className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-md text-white focus:outline-none focus:border-blue-500" value={optimizedData.datosPersonales?.contacto || ""} onChange={e => handleChange('datosPersonales', 'contacto', e.target.value)} placeholder={labels.placeholders.contact} />
        </div>
      </section>

      <section className="bg-slate-800 p-4 border border-slate-700 rounded-lg">
        <h3 className="text-slate-200 font-semibold mb-3">{labels.profile}</h3>
        <textarea className="w-full bg-slate-900 border border-slate-700 p-3 rounded-md text-white min-h-[100px] focus:outline-none focus:border-blue-500" value={optimizedData.perfilProfesional || ""} onChange={e => handleChange('perfilProfesional', null, e.target.value)} />
      </section>

      <section className="bg-slate-800 p-4 border border-slate-700 rounded-lg">
        <h3 className="text-slate-200 font-semibold mb-3">{labels.experience}</h3>
        {optimizedData.experiencia?.map((exp, i) => (
          <div key={i} className="mb-4 flex flex-col gap-3 p-4 bg-slate-900 rounded-md border border-slate-700">
            <input className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-md text-white focus:outline-none focus:border-blue-500" value={exp.cargo || ""} onChange={e => handleChange('experiencia', 'cargo', e.target.value, i)} placeholder={labels.placeholders.cargo} />
            <div className="flex gap-3">
              <input className="flex-1 bg-slate-800 border border-slate-700 px-3 py-2 rounded-md text-white focus:outline-none focus:border-blue-500" value={exp.empresa || ""} onChange={e => handleChange('experiencia', 'empresa', e.target.value, i)} placeholder={labels.placeholders.empresa} />
              <input className="w-32 bg-slate-800 border border-slate-700 px-3 py-2 rounded-md text-white focus:outline-none focus:border-blue-500" value={exp.fechas || ""} onChange={e => handleChange('experiencia', 'fechas', e.target.value, i)} placeholder={labels.placeholders.fechas} />
            </div>
            <textarea className="w-full bg-slate-800 border border-slate-700 p-3 rounded-md text-white min-h-[100px] focus:outline-none focus:border-blue-500" value={exp.descripcionSTAR || ""} onChange={e => handleChange('experiencia', 'descripcionSTAR', e.target.value, i)} placeholder={labels.placeholders.star} />
          </div>
        ))}
      </section>

      <section className="bg-slate-800 p-4 border border-slate-700 rounded-lg">
        <h3 className="text-slate-200 font-semibold mb-3">{labels.education}</h3>
        {optimizedData.educacion?.map((edu, i) => (
          <div key={i} className="mb-4 flex flex-col gap-3 p-4 bg-slate-900 rounded-md border border-slate-700">
            <input className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-md text-white focus:outline-none focus:border-blue-500" value={edu.titulo || ""} onChange={e => handleChange('educacion', 'titulo', e.target.value, i)} placeholder={labels.placeholders.titulo} />
            <input className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-md text-white focus:outline-none focus:border-blue-500" value={edu.institucion || ""} onChange={e => handleChange('educacion', 'institucion', e.target.value, i)} placeholder={labels.placeholders.institucion} />
            <input className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-md text-white focus:outline-none focus:border-blue-500" value={edu.fecha || ""} onChange={e => handleChange('educacion', 'fecha', e.target.value, i)} placeholder={labels.placeholders.fechas} />
          </div>
        ))}
      </section>

      <section className="bg-slate-800 p-4 border border-slate-700 rounded-lg">
        <h3 className="text-slate-200 font-semibold mb-3">{labels.skills}</h3>
        <input className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-md text-white focus:outline-none focus:border-blue-500" value={(optimizedData.habilidades || []).join(', ')} onChange={e => handleChange('habilidades', null, e.target.value.split(',').map(s => s.trim()))} placeholder={labels.placeholders.skills} />
      </section>
    </div>
  );
}
