import { useCallback } from 'react';
import { useCvContext } from '../context/CvContext';
import { createEmptyCv, createId } from '../utils/cvData';

export function useCvMutations() {
  const { optimizedData, setOptimizedData } = useCvContext();

  const patchData = useCallback(
    (updater, options) => {
      setOptimizedData((prev) => updater(prev || createEmptyCv()), options);
    },
    [setOptimizedData],
  );

  const updatePersonal = useCallback(
    (field, value, options) => {
      patchData(
        (prev) => ({
          ...prev,
          datosPersonales: { ...prev.datosPersonales, [field]: value },
        }),
        options,
      );
    },
    [patchData],
  );

  const updateSummary = useCallback(
    (value, options) => {
      patchData((prev) => ({ ...prev, perfilProfesional: value }), options);
    },
    [patchData],
  );

  const updateItem = useCallback(
    (section, id, patch, options) => {
      patchData(
        (prev) => ({
          ...prev,
          [section]: (prev[section] || []).map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          ),
        }),
        options,
      );
    },
    [patchData],
  );

  const addItem = useCallback(
    (section, item) => {
      patchData((prev) => ({
        ...prev,
        [section]: [...(prev[section] || []), item],
      }));
    },
    [patchData],
  );

  const removeItem = useCallback(
    (section, id) => {
      patchData((prev) => ({
        ...prev,
        [section]: (prev[section] || []).filter((item) => item.id !== id),
      }));
    },
    [patchData],
  );

  const duplicateItem = useCallback(
    (section, id) => {
      patchData((prev) => {
        const list = prev[section] || [];
        const index = list.findIndex((item) => item.id === id);
        if (index < 0) return prev;
        const clone = {
          ...JSON.parse(JSON.stringify(list[index])),
          id: createId(section.slice(0, 4)),
        };
        const next = [...list];
        next.splice(index + 1, 0, clone);
        return { ...prev, [section]: next };
      });
    },
    [patchData],
  );

  const moveItem = useCallback(
    (section, id, direction) => {
      patchData((prev) => {
        const list = [...(prev[section] || [])];
        const index = list.findIndex((item) => item.id === id);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= list.length) return prev;
        const [item] = list.splice(index, 1);
        list.splice(target, 0, item);
        return { ...prev, [section]: list };
      });
    },
    [patchData],
  );

  const updateSkills = useCallback(
    (kind, value, options) => {
      patchData(
        (prev) => ({
          ...prev,
          habilidades: { ...prev.habilidades, [kind]: value },
        }),
        options,
      );
    },
    [patchData],
  );

  const addSkill = useCallback(
    (kind, value) => {
      const clean = String(value || '').trim();
      if (!clean) return;
      patchData((prev) => {
        const current = prev.habilidades?.[kind] || [];
        if (current.some((skill) => skill.toLowerCase() === clean.toLowerCase())) return prev;
        return {
          ...prev,
          habilidades: { ...prev.habilidades, [kind]: [...current, clean] },
        };
      });
    },
    [patchData],
  );

  const removeSkill = useCallback(
    (kind, index) => {
      patchData((prev) => ({
        ...prev,
        habilidades: {
          ...prev.habilidades,
          [kind]: (prev.habilidades?.[kind] || []).filter((_, i) => i !== index),
        },
      }));
    },
    [patchData],
  );

  const renameSkill = useCallback(
    (kind, index, value) => {
      patchData(
        (prev) => ({
          ...prev,
          habilidades: {
            ...prev.habilidades,
            [kind]: (prev.habilidades?.[kind] || []).map((skill, i) =>
              i === index ? value : skill,
            ),
          },
        }),
        { record: false },
      );
    },
    [patchData],
  );

  const updateMeta = useCallback(
    (patch, options) => {
      patchData((prev) => ({ ...prev, meta: { ...prev.meta, ...patch } }), options);
    },
    [patchData],
  );

  const moveSection = useCallback(
    (section, direction) => {
      patchData((prev) => {
        const order = [...(prev.meta?.ordenSecciones || [])];
        const index = order.indexOf(section);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= order.length) return prev;
        const [item] = order.splice(index, 1);
        order.splice(target, 0, item);
        return { ...prev, meta: { ...prev.meta, ordenSecciones: order } };
      });
    },
    [patchData],
  );

  const toggleSection = useCallback(
    (section) => {
      patchData((prev) => ({
        ...prev,
        meta: {
          ...prev.meta,
          secciones: {
            ...prev.meta?.secciones,
            [section]: !(prev.meta?.secciones?.[section] !== false),
          },
        },
      }));
    },
    [patchData],
  );

  return {
    data: optimizedData,
    patchData,
    updatePersonal,
    updateSummary,
    updateItem,
    addItem,
    removeItem,
    duplicateItem,
    moveItem,
    updateSkills,
    addSkill,
    removeSkill,
    renameSkill,
    updateMeta,
    moveSection,
    toggleSection,
  };
}
