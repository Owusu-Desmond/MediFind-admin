import { getSession } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Cache the token so we don't call getSession() on every request
let cachedToken: string | null = null;

export function setApiToken(token: string | null) {
  cachedToken = token;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // First try cached token (set explicitly on login), then fall back to getSession()
  let token = cachedToken;
  if (!token) {
    const session = await getSession();
    token = session?.accessToken ?? null;
  }

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export interface ApiResponseMeta<T> {
  data: T;
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

export async function apiClientWithMeta<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponseMeta<T>> {
  let token = cachedToken;
  if (!token) {
    const session = await getSession();
    token = session?.accessToken ?? null;
  }

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  const totalCount = parseInt(response.headers.get("X-Total-Count") || "0", 10);
  const totalPages = parseInt(response.headers.get("X-Total-Pages") || "1", 10);
  const page = parseInt(response.headers.get("X-Page") || "1", 10);
  const pageSize = parseInt(response.headers.get("X-Page-Size") || "25", 10);

  const data = (await response.json()) as T;
  return { data, totalCount, totalPages, page, pageSize };
}

export interface BackendAdminNotification {
  id: number;
  recipient_type: string;
  recipient_user_id?: number;
  recipient_pharmacy_id?: number;
  notification_type: string;
  title: string;
  message: string;
  priority?: string;
  reference_type?: string;
  reference_id?: string;
  action_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface AdminNotificationListResponse {
  total: number;
  unread_count: number;
  items: BackendAdminNotification[];
}

export async function getAdminNotifications(unreadOnly = false, limit = 50): Promise<AdminNotificationListResponse> {
  const params = new URLSearchParams();
  if (unreadOnly) params.append("unread_only", "true");
  params.append("limit", limit.toString());
  return apiClient<AdminNotificationListResponse>(`/notifications?${params.toString()}`);
}

export async function markAdminNotificationRead(id: number): Promise<BackendAdminNotification> {
  return apiClient<BackendAdminNotification>(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllAdminNotificationsRead(): Promise<{ success: boolean; message: string; marked_count: number }> {
  return apiClient<{ success: boolean; message: string; marked_count: number }>("/notifications/mark-all-read", {
    method: "POST",
  });
}

