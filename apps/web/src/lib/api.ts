const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://jidex-api-production.up.railway.app";

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    const response = await fetch(API_BASE_URL + path, {
      ...options,
      signal: controller.signal,
      headers: {
      Accept: "application/json",
      ...(options?.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options?.headers || {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    let message =
      "JIDEX API request failed: " +
      response.status +
      " " +
      response.statusText;

    try {
      const errorBody = (await response.json()) as {
        error?: string;
        details?: unknown;
      };

      if (errorBody.error) {
        message = errorBody.error;

        if (typeof errorBody.details === "string") {
          message += ": " + errorBody.details;
        }
      }
    } catch {
      // Keep the default HTTP error message.
    }

    throw new Error(message);
  }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

/* Auth */

export type AuthRole =
  | "PARTICIPANT"
  | "OPERATOR"
  | "ADMIN";

export type AuthStatus =
  | "ACTIVE"
  | "INACTIVE";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  status: AuthStatus;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    return await apiFetch<AuthUser>("/api/v1/auth/me");
  } catch {
    return null;
  }
}

export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export async function register(
  input: RegisterInput,
): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/api/v1/auth/logout", {
    method: "POST",
  });
}

/* Public content */

export type EventItem = {
  id: string;
  titleId: string;
  titleEn: string;
  descriptionId?: string | null;
  descriptionEn?: string | null;
  startAt: string;
  endAt: string;
  location?: string | null;
};

export type ScheduleItem = {
  id: string;
  titleId: string;
  titleEn: string;
  descriptionId?: string | null;
  descriptionEn?: string | null;
  startAt: string;
  endAt: string;
  location?: string | null;
  sortOrder: number;
};

export type NewsItem = {
  id: string;
  titleId: string;
  titleEn: string;
  excerptId?: string | null;
  excerptEn?: string | null;
  slug: string;
  publishedAt?: string | null;
};

export async function getEvents(): Promise<EventItem[]> {
  return apiFetch<EventItem[]>("/api/v1/events");
}

export async function getSchedules(): Promise<ScheduleItem[]> {
  return apiFetch<ScheduleItem[]>("/api/v1/schedules");
}

export async function getNews(): Promise<NewsItem[]> {
  return apiFetch<NewsItem[]>("/api/v1/news");
}

/* Admin News */

export type AdminNewsItem = {
  id: string;
  slug: string;
  titleId: string;
  titleEn: string;
  excerptId?: string | null;
  excerptEn?: string | null;
  contentId: string;
  contentEn: string;
  coverImage?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NewsInput = {
  slug: string;
  titleId: string;
  titleEn: string;
  excerptId?: string | null;
  excerptEn?: string | null;
  contentId: string;
  contentEn: string;
  coverImage?: string | null;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: string | null;
};

export type NewsUpdateInput = Partial<NewsInput>;

export type NewsTranslationInput = {
  titleId: string;
  excerptId?: string | null;
  contentId: string;
};

export type NewsTranslationResult = {
  titleEn: string;
  excerptEn: string | null;
  contentEn: string;
};

export async function getAdminNews(): Promise<AdminNewsItem[]> {
  return apiFetch<AdminNewsItem[]>("/api/v1/admin/news");
}

export async function getAdminNewsById(
  id: string,
): Promise<AdminNewsItem> {
  return apiFetch<AdminNewsItem>(
    `/api/v1/admin/news/${encodeURIComponent(id)}`,
  );
}

export async function createAdminNews(
  input: NewsInput,
): Promise<AdminNewsItem> {
  return apiFetch<AdminNewsItem>("/api/v1/admin/news", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAdminNews(
  id: string,
  input: NewsUpdateInput,
): Promise<AdminNewsItem> {
  return apiFetch<AdminNewsItem>(
    `/api/v1/admin/news/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export async function deleteAdminNews(
  id: string,
): Promise<void> {
  await apiFetch<void>(
    `/api/v1/admin/news/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}

export async function translateAdminNews(
  id: string,
  input: NewsTranslationInput,
): Promise<NewsTranslationResult> {
  return apiFetch<NewsTranslationResult>(
    `/api/v1/admin/news/${encodeURIComponent(id)}/translate`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}
