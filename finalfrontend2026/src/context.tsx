import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Screen, InspectionData, AppContextType } from './types';

const noop = () => {};

const defaultCtx: AppContextType = {
  screen: 'splash',
  navigate: noop as (s: Screen) => void,
  inspectionData: { batchId: '', center: '', inspector: '', variety: '', quantity: '' },
  setInspectionData: noop as (d: InspectionData) => void,
  selectedReportId: null,
  setSelectedReportId: noop as (id: string | null) => void,
};

const AppContext = createContext<AppContextType>(defaultCtx);

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('login');
  const [inspectionData, setInspectionData] = useState<InspectionData>({
    batchId: '',
    center: '',
    inspector: '',
    variety: '',
    quantity: '',
  });
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        screen,
        navigate: setScreen,
        inspectionData,
        setInspectionData,
        selectedReportId,
        setSelectedReportId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  return useContext(AppContext);
}
