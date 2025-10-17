import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VoiceCommandsContextType {
  showVoiceCommands: boolean;
  setShowVoiceCommands: (show: boolean) => void;
  toggleVoiceCommands: () => void;
}

const VoiceCommandsContext = createContext<VoiceCommandsContextType | undefined>(undefined);

interface VoiceCommandsProviderProps {
  children: ReactNode;
}

export const VoiceCommandsProvider: React.FC<VoiceCommandsProviderProps> = ({ children }) => {
  const [showVoiceCommands, setShowVoiceCommands] = useState(false);

  const toggleVoiceCommands = () => {
    setShowVoiceCommands(!showVoiceCommands);
  };

  const value: VoiceCommandsContextType = {
    showVoiceCommands,
    setShowVoiceCommands,
    toggleVoiceCommands
  };

  return (
    <VoiceCommandsContext.Provider value={value}>
      {children}
    </VoiceCommandsContext.Provider>
  );
};

export const useVoiceCommands = (): VoiceCommandsContextType => {
  const context = useContext(VoiceCommandsContext);
  if (!context) {
    throw new Error('useVoiceCommands must be used within a VoiceCommandsProvider');
  }
  return context;
};