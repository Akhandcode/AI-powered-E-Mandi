const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  organization?: string;
  center_id?: string;
  created_at: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface LotItem {
  id: number;
  lot_number: string;
  procurement_center: string;
  commodity: string;
  variety?: string;
  total_weight_kg: number;
  bag_count: number;
  farmer_name?: string;
  status: string;
  created_at: string;
  images: any[];
}

export interface AssessmentResult {
  id: number;
  lot_id: number;
  sample_count: number;
  grade_a_percentage: number;
  urs_percentage: number;
  fresh_pct: number;
  sprouted_pct: number;
  damaged_pct: number;
  rotten_pct: number;
  undersized_pct: number;
  lqi_score: number;
  lqi_lower_ci: number;
  lqi_upper_ci: number;
  recommended_channel: string;
  evaluated_at: string;
}

export interface QualityReportData {
  id: number;
  report_number: string;
  lot_id: number;
  report_hash: string;
  summary: any;
  is_disputed: boolean;
  dispute_reason?: string;
  created_at: string;
}

export interface MarketRecommendationData {
  lot_id: number;
  commodity: string;
  grade_a_pct: number;
  urs_pct: number;
  lqi_score: number;
  current_mandi_price_per_kg: number;
  forecasted_7day_price_per_kg: number;
  price_trend: 'UPWARD' | 'STABLE' | 'DOWNWARD';
  optimal_action: string;
  channel_recommendations: Array<{
    channel: string;
    recommended_pct: number;
    expected_price_per_kg: number;
    net_return_inr: number;
    description: string;
  }>;
}

let storedToken: string | null = localStorage.getItem('emandi_access_token');

export function setAuthToken(token: string | null) {
  storedToken = token;
  if (token) {
    localStorage.setItem('emandi_access_token', token);
  } else {
    localStorage.removeItem('emandi_access_token');
  }
}

export function getAuthToken(): string | null {
  return storedToken || localStorage.getItem('emandi_access_token');
}

function getHeaders(extraHeaders: Record<string, string> = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Register User
 */
export async function registerUser(payload: {
  email: string;
  name: string;
  password: string;
  role?: string;
  organization?: string;
  center_id?: string;
}): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || 'Registration failed');
  }
  return res.json();
}

/**
 * Login User
 */
export async function loginUser(email: string, password: string): Promise<AuthTokenResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Invalid credentials' }));
    throw new Error(err.detail || 'Login failed');
  }
  const data: AuthTokenResponse = await res.json();
  setAuthToken(data.access_token);
  return data;
}

/**
 * Get Profile
 */
export async function getProfile(): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch profile');
  }
  return res.json();
}

/**
 * Create Inspection Lot
 */
export async function createLot(payload: {
  procurement_center: string;
  commodity?: string;
  variety?: string;
  total_weight_kg: number;
  bag_count: number;
  farmer_name?: string;
}): Promise<LotItem> {
  const res = await fetch(`${API_BASE_URL}/lots/`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create lot' }));
    throw new Error(err.detail || 'Failed to create inspection lot');
  }
  return res.json();
}

/**
 * List Inspection Lots
 */
export async function listLots(skip: number = 0, limit: number = 50): Promise<LotItem[]> {
  const res = await fetch(`${API_BASE_URL}/lots/?skip=${skip}&limit=${limit}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to list inspection lots');
  }
  return res.json();
}

/**
 * Upload Sample Images for a Lot
 */
export async function uploadLotImages(lotId: number, files: File[]): Promise<any[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const res = await fetch(`${API_BASE_URL}/lots/${lotId}/images`, {
    method: 'POST',
    headers: getHeaders(),
    body: formData,
  });
  if (!res.ok) {
    throw new Error('Failed to upload sample images');
  }
  return res.json();
}

/**
 * Run AI Quality Assessment (Invokes Grader & Dirichlet Estimator)
 */
export async function runAIAssessment(
  lotId: number,
  sampleSize: number = 40,
  useDebias: boolean = true
): Promise<AssessmentResult> {
  const res = await fetch(`${API_BASE_URL}/lots/${lotId}/assess`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ sample_size: sampleSize, use_debias: useDebias }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'AI Assessment failed' }));
    throw new Error(err.detail || 'AI Quality Assessment failed');
  }
  return res.json();
}

/**
 * Get Quality Report
 */
export async function getQualityReport(lotId: number): Promise<QualityReportData> {
  const res = await fetch(`${API_BASE_URL}/reports/lots/${lotId}/report`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch digital quality report');
  }
  return res.json();
}

/**
 * Download / View HTML Certificate URL
 */
export function getReportHtmlUrl(lotId: number): string {
  return `${API_BASE_URL}/reports/lots/${lotId}/report/html`;
}

/**
 * Get Market Recommendation
 */
export async function getMarketRecommendation(lotId: number): Promise<MarketRecommendationData> {
  const res = await fetch(`${API_BASE_URL}/market/lots/${lotId}/market-recommendation`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch market recommendations');
  }
  return res.json();
}
