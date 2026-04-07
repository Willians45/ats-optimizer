import { useCvContext } from '../context/CvContext';

export default function CVEditor() {
  const { optimizedData, setOptimizedData } = useCvContext();

  if (!optimizedData) {
    return (
      <div className="p-4 text-center text-slate-400">
        No hay datos optimizados aún. Procesa el CV primero.
      </div>
    );
  }

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
    <div className="flex flex-col gap-6 w-full h-full text-sm">
      <section className="bg-slate-800 p-4 border border-slate-700 rounded-lg">
        <h3 className="text-slate-200 font-semibold mb-3">Datos Personales</h3>
        <div className="flex flex-col gap-3">
          <input className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-md text-white focus:outline-none focus:border-blue-500" value={optimizedData.datosPersonales?.nombre || ""} onChange={e => handleChange('datosPersonales', 'nombre', e.target.value)} placeholder="Nombre completo" />
          <input className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-md text-white focus:outline-none focus:border-blue-500" value={optimizedData.datosPersonales?.contacto || ""} onChange={e => handleChange('datosPersonales', 'contacto', e.target.value)} placeholder="Ej. email@... | Tel..." />
        </div>
      </section>

      <section className="bg-slate-800 p-4 border border-slate-700 rounded-lg">
        <h3 className="text-slate-200 font-semibold mb-3">Perfil Profesional</h3>
        <textarea className="w-full bg-slate-900 border border-slate-700 p-3 rounded-md text-white min-h-[100px] focus:outline-none focus:border-blue-500" value={optimizedData.perfilProfesional || ""} onChange={e => handleChange('perfilProfesional', null, e.target.value)} />
      </section>

      <section className="bg-slate-800 p-4 border border-slate-700 rounded-lg">
        <h3 className="text-slate-200 font-semibold mb-3">Experiencia (STAR)</h3>
        {optimizedData.experiencia?.map((exp, i) => (
          <div key={i} className="mb-4 flex flex-col gap-3 p-4 bg-slate-900 rounded-md border border-slate-700">
            <input className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-md text-white focus:outline-none focus:border-blue-500" value={exp.cargo || ""} onChange={e => handleChange('experiencia', 'cargo', e.target.value, i)} placeholder="Cargo" />
            <div className="flex gap-3">
              <input className="flex-1 bg-slate-800 border border-slate-700 px-3 py-2 rounded-md text-white focus:outline-none focus:border-blue-500" value={exp.empresa || ""} onChange={e => handleChange('experiencia', 'empresa', e.target.value, i)} placeholder="Empresa" />
              <input className="w-32 bg-slate-800 border border-slate-700 px-3 py-2 rounded-md text-white focus:outline-none focus:border-blue-500" value={exp.fechas || ""} onChange={e => handleChange('experiencia', 'fechas', e.target.value, i)} placeholder="Fechas" />
            </div>
            <textarea className="w-full bg-slate-800 border border-slate-700 p-3 rounded-md text-white min-h-[100px] focus:outline-none focus:border-blue-500" value={exp.descripcionSTAR || ""} onChange={e => handleChange('experiencia', 'descripcionSTAR', e.target.value, i)} placeholder="Puntos en formato viñetas" />
          </div>
        ))}
      </section>

      <section className="bg-slate-800 p-4 border border-slate-700 rounded-lg">
        <h3 className="text-slate-200 font-semibold mb-3">Educación</h3>
        {optimizedData.educacion?.map((edu, i) => (
          <div key={i} className="mb-4 flex flex-col gap-3 p-4 bg-slate-900 rounded-md border border-slate-700">
            <input className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-md text-white focus:outline-none focus:border-blue-500" value={edu.titulo || ""} onChange={e => handleChange('educacion', 'titulo', e.target.value, i)} placeholder="Título" />
            <input className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-md text-white focus:outline-none focus:border-blue-500" value={edu.institucion || ""} onChange={e => handleChange('educacion', 'institucion', e.target.value, i)} placeholder="Institución" />
            <input className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-md text-white focus:outline-none focus:border-blue-500" value={edu.fecha || ""} onChange={e => handleChange('educacion', 'fecha', e.target.value, i)} placeholder="Fechas" />
          </div>
        ))}
      </section>

      <section className="bg-slate-800 p-4 border border-slate-700 rounded-lg">
        <h3 className="text-slate-200 font-semibold mb-3">Habilidades</h3>
        <input className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-md text-white focus:outline-none focus:border-blue-500" value={(optimizedData.habilidades || []).join(', ')} onChange={e => handleChange('habilidades', null, e.target.value.split(',').map(s => s.trim()))} placeholder="Skill 1, Skill 2, ..." />
      </section>
    </div>
  );
}
