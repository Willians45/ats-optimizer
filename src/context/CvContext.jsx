import { createContext, useContext, useState } from 'react';

const CvContext = createContext();

export function CvProvider({ children }) {
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [optimizedData, setOptimizedData] = useState(null);
  const [language, setLanguage] = useState("es"); // 'es' | 'en'
  
  return (
    <CvContext.Provider value={{ 
      cvText, setCvText, 
      jobDescription, setJobDescription, 
      optimizedData, setOptimizedData,
      language, setLanguage
    }}>
      {children}
    </CvContext.Provider>
  );
}

export function useCvContext() {
  return useContext(CvContext);
}
