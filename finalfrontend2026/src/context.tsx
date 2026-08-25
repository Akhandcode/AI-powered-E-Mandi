import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Screen, InspectionData, AppContextType } from './types';

const noop = () => {};

const defaultCtx: AppContextType = {
  screen: 'splash',
  navigate: noop as (s: Screen) => void,
  inspectionData: { batchId: '', center: '', inspector: '', variety: '', quantity: '', commodity: 'Onion', farmerName: '' },
  setInspectionData: noop as (d: InspectionData) => void,
  selectedReportId: null,
  setSelectedReportId: noop as (id: string | null) => void,
  activeLotId: null,
  setActiveLotId: noop as (id: number | null) => void,
  assessmentResult: null,
  setAssessmentResult: noop as (res: any | null) => void,
  currentUser: null,
  setCurrentUser: noop as (user: any | null) => void,
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
    commodity: 'Onion',
    farmerName: '',
  });
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [activeLotId, setActiveLotId] = useState<number | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  return (
    <AppContext.Provider
      value={{
        screen,
        navigate: setScreen,
        inspectionData,
        setInspectionData,
        selectedReportId,
        setSelectedReportId,
        activeLotId,
        setActiveLotId,
        assessmentResult,
        setAssessmentResult,
        currentUser,
        setCurrentUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  return useContext(AppContext);
}
