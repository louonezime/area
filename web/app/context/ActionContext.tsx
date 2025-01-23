"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface ActionContextType {
  isActionSet: boolean;
  setActionTrue: () => void;
  setActionFalse: () => void;
}

const ActionContext = createContext<ActionContextType | undefined>(undefined);

export const ActionStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isActionSet, setIsActionSet] = useState<boolean>(false);
  const setActionTrue = () => setIsActionSet(true);
  const setActionFalse = () => setIsActionSet(false);

  return (
    <ActionContext.Provider
      value={{ isActionSet, setActionTrue, setActionFalse }}
    >
      {children}
    </ActionContext.Provider>
  );
};

export const useActionContext = () => {
  const context = useContext(ActionContext);
  if (!context) {
    throw new Error("error: need AuthProvider enroll (in layout)");
  }
  return context;
};
