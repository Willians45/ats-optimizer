/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { createEmptyCv } from '../utils/cvData';
import { loadPersistedState, savePersistedState } from '../utils/storage';

const CvContext = createContext(null);

const initialHistory = {
  data: null,
  past: [],
  future: [],
  editBase: null,
};

function historyReducer(state, action) {
  switch (action.type) {
    case 'SET': {
      const next =
        typeof action.payload === 'function' ? action.payload(state.data) : action.payload;
      if (next === state.data) return state;
      const shouldRecord = action.record !== false;
      return {
        ...state,
        data: next,
        past: shouldRecord ? [...state.past, state.data].filter(Boolean).slice(-60) : state.past,
        future: shouldRecord ? [] : state.future,
        editBase: null,
      };
    }
    case 'BEGIN_EDIT':
      return { ...state, editBase: state.data };
    case 'END_EDIT': {
      if (!state.editBase || state.editBase === state.data) {
        return { ...state, editBase: null };
      }
      return {
        ...state,
        past: [...state.past, state.editBase].filter(Boolean).slice(-60),
        future: [],
        editBase: null,
      };
    }
    case 'UNDO': {
      if (!state.past.length) return state;
      const previous = state.past[state.past.length - 1];
      return {
        ...state,
        data: previous,
        past: state.past.slice(0, -1),
        future: [state.data, ...state.future].filter(Boolean).slice(0, 60),
        editBase: null,
      };
    }
    case 'REDO': {
      if (!state.future.length) return state;
      const next = state.future[0];
      return {
        ...state,
        data: next,
        past: [...state.past, state.data].filter(Boolean).slice(-60),
        future: state.future.slice(1),
        editBase: null,
      };
    }
    case 'RESET':
      return {
        ...initialHistory,
        data: action.payload || null,
      };
    default:
      return state;
  }
}

export function CvProvider({ children }) {
  const [persisted] = useState(() => loadPersistedState());
  const [state, dispatch] = useReducer(historyReducer, {
    ...initialHistory,
    data: persisted.data,
  });
  const [context, setContextState] = useState(persisted.context);
  const [template, setTemplate] = useState(persisted.ui.template);
  const [accent, setAccent] = useState(persisted.ui.accent);
  const [cvText, setCvText] = useState(persisted.draft.cvText);
  const [jobDescription, setJobDescription] = useState(persisted.draft.jobDescription);
  const [jobImage, setJobImage] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved');
  const isFirstSave = useRef(true);

  useEffect(() => {
    if (isFirstSave.current) {
      isFirstSave.current = false;
      return undefined;
    }
    const savingTimer = setTimeout(() => setSaveStatus('saving'), 0);
    const timer = setTimeout(() => {
      savePersistedState({
        data: state.data,
        context,
        ui: { template, accent },
        draft: { cvText, jobDescription },
      });
      setSaveStatus('saved');
    }, 700);
    return () => {
      clearTimeout(savingTimer);
      clearTimeout(timer);
    };
  }, [state.data, context, template, accent, cvText, jobDescription]);

  const updateContext = useCallback((patch) => {
    setContextState((prev) => ({ ...prev, ...patch }));
  }, []);

  const setLanguage = useCallback(
    (language) => {
      updateContext({ language });
    },
    [updateContext],
  );

  const setOptimizedData = useCallback((updater, options = {}) => {
    dispatch({ type: 'SET', payload: updater, record: options.record !== false });
  }, []);

  const beginEdit = useCallback(() => dispatch({ type: 'BEGIN_EDIT' }), []);
  const endEdit = useCallback(() => dispatch({ type: 'END_EDIT' }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const resetCv = useCallback((data = null) => dispatch({ type: 'RESET', payload: data }), []);
  const clearCv = useCallback(() => {
    dispatch({ type: 'RESET', payload: createEmptyCv() });
  }, []);

  const value = useMemo(
    () => ({
      cvText,
      setCvText,
      jobDescription,
      setJobDescription,
      jobImage,
      setJobImage,
      context,
      updateContext,
      language: context.language,
      setLanguage,
      optimizedData: state.data,
      setOptimizedData,
      beginEdit,
      endEdit,
      undo,
      redo,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
      resetCv,
      clearCv,
      template,
      setTemplate,
      accent,
      setAccent,
      saveStatus,
    }),
    [
      cvText,
      jobDescription,
      jobImage,
      context,
      updateContext,
      setLanguage,
      state.data,
      state.past.length,
      state.future.length,
      setOptimizedData,
      beginEdit,
      endEdit,
      undo,
      redo,
      resetCv,
      clearCv,
      template,
      accent,
      saveStatus,
    ],
  );

  return <CvContext.Provider value={value}>{children}</CvContext.Provider>;
}

export function useCvContext() {
  const value = useContext(CvContext);
  if (!value) {
    throw new Error('useCvContext debe usarse dentro de CvProvider');
  }
  return value;
}
