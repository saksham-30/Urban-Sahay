const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken(): string | null {
  return localStorage.getItem('urban_sahay_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data as T;
}

export const api = {
  // Auth
  register: (body: Record<string, unknown>) =>
    request<{ token: string; user: AuthUser }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (email: string, password: string) =>
    request<{ token: string; user: AuthUser }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // User profile
  getProfile: () => request<UserProfile>('/users/profile'),
  updateProfile: (body: { fullName: string; phone: string }) =>
    request<UserProfile>('/users/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Provider profile
  getProviderProfile: () => request<ProviderProfile>('/providers/profile'),
  updateProviderProfile: (body: Partial<ProviderProfile>) =>
    request<ProviderProfile>('/providers/profile', { method: 'PUT', body: JSON.stringify(body) }),
  searchProviders: (params: { serviceType?: string; city?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<ProviderProfile[]>(`/providers?${qs}`);
  },
  getProviderByUserId: (userId: string) => request<ProviderProfile>(`/providers/${userId}`),

  // Concerns
  raiseConcern: (body: ConcernPayload) =>
    request<Concern>('/concerns', { method: 'POST', body: JSON.stringify(body) }),
  getConcerns: () => request<Concern[]>('/concerns'),

  // Conversations
  getConversations: () => request<ConversationItem[]>('/conversations'),
  findOrCreateConversation: (targetUserId: string) =>
    request<ConversationItem>('/conversations', { method: 'POST', body: JSON.stringify({ targetUserId }) }),
  getMessages: (conversationId: string) =>
    request<Message[]>(`/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, body: MessagePayload) =>
    request<Message>(`/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify(body) }),
  markMessagesRead: (conversationId: string) =>
    request<{ success: boolean }>(`/conversations/${conversationId}/messages/read`, { method: 'PATCH' }),
  getUserName: (userId: string) =>
    request<{ name: string }>(`/conversations/user/${userId}/name`),

  // KYC
  getKyc: () => request<KycStatus>('/kyc'),
  updateKyc: (body: Partial<KycStatus>) =>
    request<KycStatus>('/kyc', { method: 'PUT', body: JSON.stringify(body) }),
  resetKyc: () => request<KycStatus>('/kyc/reset', { method: 'POST' }),
};

// ── Types ──────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  role: 'user' | 'service_provider';
}

export interface UserProfile {
  _id: string;
  userId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderProfile {
  _id: string;
  userId: string;
  fullName: string;
  serviceType: string;
  city: string;
  phone: string;
  description: string | null;
  experienceYears: number | null;
  hourlyRate: string | null;
  rating: number;
  totalReviews: number;
  isAvailable: boolean;
  isVerified: boolean;
  serviceRadius: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConcernPayload {
  name: string;
  phone: string;
  location: string;
  serviceType: string;
  concern: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface Concern extends ConcernPayload {
  _id: string;
  userId: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface ConversationItem {
  _id: string;
  customerId: string;
  providerId: string;
  jobContext: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  imageUrl: string | null;
  messageType: string;
  isAuto: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface MessagePayload {
  content?: string;
  imageUrl?: string;
  messageType?: string;
  isAuto?: boolean;
}

export interface KycStatus {
  _id: string;
  userId: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  phoneNumber: string | null;
  aadhaarNumber: string | null;
  aadhaarVerified: boolean;
  selfieUrl: string | null;
  selfieVerified: boolean;
  isFullyVerified: boolean;
}
