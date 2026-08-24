export type Screen =
  | 'splash'
  | 'login'
  | 'dashboard'
  | 'new-inspection'
  | 'camera'
  | 'capture-sample'
  | 'ai-analysis'
  | 'ai-detection-results'
  | 'size-measurement'
  | 'detection-results'
  | 'quality-assessment'
  | 'final-report'
  | 'history'
  | 'report-details'
  | 'profile';

export interface InspectionData {
  batchId: string;
  center: string;
  inspector: string;
  variety: string;
  quantity: string;
  capturedImage?: string | null;
}

export interface AppContextType {
  screen: Screen;
  navigate: (s: Screen) => void;
  inspectionData: InspectionData;
  setInspectionData: (d: InspectionData) => void;
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
}
