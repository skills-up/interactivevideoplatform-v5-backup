"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type UITemplate } from "@/types/ui-template";

interface UITemplateContextType {
 currentTemplate: UITemplate | null;
 setTemplate: (template: UITemplate | null) => void;
}

const UITemplateContext = createContext<UITemplateContextType | undefined>(undefined);

export function UITemplateProvider({ children }: { children: ReactNode }) {
 const [currentTemplate, setCurrentTemplate] = useState<UITemplate | null>(null);

 // Load template from local storage on mount
 useEffect(() => {
   const storedTemplate = localStorage.getItem('ui-template');
   if (storedTemplate) {
     try {
       setCurrentTemplate(JSON.parse(storedTemplate));
     } catch (error) {
       console.error("Error parsing stored UI template:", error);
     }
   }
 }, []);

 // Save template to local storage on change
 useEffect(() => {
   if (currentTemplate) {
     localStorage.setItem('ui-template', JSON.stringify(currentTemplate));
   } else {
     localStorage.removeItem('ui-template');
   }
 }, [currentTemplate]);

 const setTemplate = (template: UITemplate | null) => {
   setCurrentTemplate(template);
 };

 return (
   <UITemplateContext.Provider value={{ currentTemplate, setTemplate }}>
     {children}
   </UITemplateContext.Provider>
 );
}

export function useUITemplate() {
 const context = useContext(UITemplateContext);
 if (!context) {
   throw new Error("useUITemplate must be used within a UITemplateProvider");
 }
 return context;
}

