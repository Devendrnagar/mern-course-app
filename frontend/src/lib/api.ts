export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export interface ApiError {
  message: string;
}

export interface ApiCourse {
  _id: string;
  course_id?: string;
  title: string;
  description?: string;
  category?: string;
  instructor?: string;
  duration?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSuccessResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface MessageResponse {
  message: string;
}

export interface CoursesResponse {
  source: 'mongodb' | 'redis-cache' | string;
  data: ApiCourse[];
}

export interface RecommendationResponse {
  topic: string;
  level: string;
  courses: Array<{
    title: string;
    level: string;
  }>;
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('mxpertz_token');
}

function withAuthHeaders(token?: string | null): HeadersInit {
  const resolvedToken = token ?? getStoredToken();

  if (!resolvedToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${resolvedToken}`,
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message || 'Request failed';
    throw new Error(message);
  }

  return payload as T;
}

export async function login(email: string, password: string): Promise<AuthSuccessResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return parseResponse<AuthSuccessResponse>(response);
}

export async function signup(email: string, password: string): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return parseResponse<MessageResponse>(response);
}

export async function uploadCoursesCsv(file: File): Promise<{ message: string; count: number }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/courses/upload`, {
    method: 'POST',
    headers: {
      ...withAuthHeaders(),
    },
    body: formData,
  });

  return parseResponse<{ message: string; count: number }>(response);
}

export async function getCourses(): Promise<CoursesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/courses`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  return parseResponse<CoursesResponse>(response);
}

export async function getCourseById(id: string): Promise<ApiCourse> {
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  return parseResponse<ApiCourse>(response);
}

export async function recommendCourses(topic: string, level: string): Promise<RecommendationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic, level }),
  });

  return parseResponse<RecommendationResponse>(response);
}

export async function getAdminProfile(token?: string): Promise<{ message: string; user: { id: string; email: string } }> {
  const response = await fetch(`${API_BASE_URL}/api/admin`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...withAuthHeaders(token),
    },
    cache: 'no-store',
  });

  return parseResponse<{ message: string; user: { id: string; email: string } }>(response);
}
