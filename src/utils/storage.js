import { normalizeCvData } from './cvData';

export const STORAGE_KEYS = {
  data: 'ats.cv.v2',
  context: 'ats.context.v2',
  ui: 'ats.ui.v2',
  draft: 'ats.draft.v2',
  apiKey: 'ats.gemini.key',
  legacyApiKey: 'gemini_api_key',
  model: 'ats.gemini.model',
  clearWarning: 'ats.clearWarning.v1',
};

export const STORAGE_EVENTS = {
  keyChanged: 'ats:key-changed',
  modelChanged: 'ats:model-changed',
};

function emit(name) {
  try {
    window.dispatchEvent(new CustomEvent(name));
  } catch {
    // noop
  }
}

export const DEFAULT_CONTEXT = {
  targetRole: '',
  company: '',
  seniority: '',
  industry: '',
  tone: 'professional',
  language: 'es',
  mustInclude: '',
  mustAvoid: '',
  maxPages: 2,
  focus: 'ATS',
  customInstructions: '',
};

export const DEFAULT_UI = {
  template: 'classic',
  accent: 'purple',
  zoom: 90,
  rightPanelOpen: true,
  activePanel: 'content',
};

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadPersistedState() {
  const data = read(STORAGE_KEYS.data);
  const context = read(STORAGE_KEYS.context);
  const ui = read(STORAGE_KEYS.ui);
  const draft = read(STORAGE_KEYS.draft);

  return {
    data: data ? normalizeCvData(data, { targetRole: context?.targetRole || '', language: context?.language || 'es' }) : null,
    context: { ...DEFAULT_CONTEXT, ...(context || {}) },
    ui: { ...DEFAULT_UI, ...(ui || {}) },
    draft: {
      cvText: typeof draft?.cvText === 'string' ? draft.cvText : '',
      jobDescription: typeof draft?.jobDescription === 'string' ? draft.jobDescription : '',
    },
  };
}

export function savePersistedState({ data, context, ui, draft }) {
  if (data) write(STORAGE_KEYS.data, data);
  if (context) write(STORAGE_KEYS.context, context);
  if (ui) write(STORAGE_KEYS.ui, ui);
  if (draft) write(STORAGE_KEYS.draft, draft);
}

export function clearPersistedData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.data);
  } catch {
    // noop
  }
}

export function clearWorkspaceStorage() {
  try {
    localStorage.removeItem(STORAGE_KEYS.data);
    localStorage.removeItem(STORAGE_KEYS.draft);
    localStorage.removeItem(STORAGE_KEYS.context);
  } catch {
    // noop
  }
}

export function isClearWarningDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEYS.clearWarning) === '1';
  } catch {
    return false;
  }
}

export function setClearWarningDismissed(dismissed) {
  try {
    if (dismissed) localStorage.setItem(STORAGE_KEYS.clearWarning, '1');
    else localStorage.removeItem(STORAGE_KEYS.clearWarning);
  } catch {
    // noop
  }
}

export function getUserApiKey() {
  try {
    const current = localStorage.getItem(STORAGE_KEYS.apiKey);
    if (current) return current;
    const legacy = localStorage.getItem(STORAGE_KEYS.legacyApiKey);
    if (legacy) {
      localStorage.setItem(STORAGE_KEYS.apiKey, legacy);
      localStorage.removeItem(STORAGE_KEYS.legacyApiKey);
      return legacy;
    }
    return '';
  } catch {
    return '';
  }
}

export function setUserApiKey(key) {
  try {
    localStorage.setItem(STORAGE_KEYS.apiKey, key.trim());
    emit(STORAGE_EVENTS.keyChanged);
    return true;
  } catch {
    return false;
  }
}

export function clearUserApiKey() {
  try {
    localStorage.removeItem(STORAGE_KEYS.apiKey);
    localStorage.removeItem(STORAGE_KEYS.legacyApiKey);
    emit(STORAGE_EVENTS.keyChanged);
    return true;
  } catch {
    return false;
  }
}

export function getPreferredModel() {
  try {
    return localStorage.getItem(STORAGE_KEYS.model) || '';
  } catch {
    return '';
  }
}

export function setPreferredModel(model) {
  try {
    if (model) localStorage.setItem(STORAGE_KEYS.model, model);
    else localStorage.removeItem(STORAGE_KEYS.model);
    emit(STORAGE_EVENTS.modelChanged);
    return true;
  } catch {
    return false;
  }
}

export function maskApiKey(key) {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}
