const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://jidex-api-production.up.railway.app";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(API_BASE_URL + path, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options?.body ? { "Content-Type": "application/json" } : {}),
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

export type AuthRole = "PARTICIPANT" | "OPERATOR" | "ADMIN";
export type AuthStatus = "ACTIVE" | "INACTIVE";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  status: AuthStatus;
};

type AuthResponse = {
  user: AuthUser;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await apiFetch<AuthResponse>("/api/v1/auth/me");
    return response.user;
  } catch {
    return null;
  }
}

export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  const response = await apiFetch<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return response.user;
}

export async function register(
  input: RegisterInput,
): Promise<AuthUser> {
  const response = await apiFetch<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.user;
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

export async function deleteAdminNews(id: string): Promise<void> {
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

/* Participant / Exhibitor */

export type ParticipantProfile = {
  id: string;
  userId: string;
  fullName: string;
  position?: string | null;
  institution?: string | null;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  website?: string | null;
  socialMedia?: string | null;
};

export type Artwork = {
  id: string;
  submissionId: string;
  sequence: number;
  status: "DRAFT" | "SUBMITTED" | "SELECTED" | "NOT_SELECTED";
  title: string;
  year?: number | null;
  category?: string | null;
  medium?: string | null;
  dimensions?: string | null;
  materials?: string | null;
  duration?: string | null;
  shortDescription?: string | null;
  designConcept?: string | null;
  keywords?: string | null;
  physicalWidthCm?: number | string | null;
  physicalHeightCm?: number | string | null;
  physicalDepthCm?: number | string | null;
  weightKg?: number | string | null;
  installationType?: string | null;
  installationHeight?: string | null;
  viewingDistance?: string | null;
  mountingMethod?: string | null;
  lightingRequirements?: string | null;
  powerRequirements?: string | null;
  specialToolsEquipment?: string | null;
  safetyConsiderations?: string | null;
  installationArea?: string | null;
  componentCount?: number | null;
  installationTime?: string | null;
  technicalRequirements?: string | null;
  hardwareRequirements?: string | null;
  softwareRequirements?: string | null;
  displayRequirements?: string | null;
  internetRequirements?: string | null;
  installationInstructions?: string | null;
  userInteractionInstructions?: string | null;
  selectionNote?: string | null;
  selectedAt?: string | null;
  supportingMaterials?: SupportingMaterial[];
};

export type SupportingMaterial = {
  id: string;
  artworkId: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT" | "PORTFOLIO" | "OTHER";
  title?: string | null;
  fileName: string;
  fileUrl: string;
  mimeType?: string | null;
  fileSize?: number | null;
  sortOrder: number;
};

export type ExhibitorSubmission = {
  id: string;
  participantId: string;
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "DECISION_MADE"
    | "WITHDRAWN";
  submittedAt?: string | null;
  reviewedAt?: string | null;
  decidedAt?: string | null;
  reviewerNote?: string | null;
  declarationAccurate: boolean;
  declarationOriginal: boolean;
  declarationDeadline: boolean;
  declarationTechnical: boolean;
  declarationGuidelines: boolean;
  declarationIp: boolean;
  artworks: Artwork[];
};

export type ParticipantProfileInput = Partial<
  Omit<ParticipantProfile, "id" | "userId">
>;

export type ArtworkInput = Partial<
  Omit<
    Artwork,
    | "id"
    | "submissionId"
    | "sequence"
    | "status"
    | "supportingMaterials"
    | "selectionNote"
    | "selectedAt"
  >
> & {
  title: string;
};

export async function getParticipantProfile(): Promise<ParticipantProfile> {
  return apiFetch<ParticipantProfile>("/api/v1/participant/profile");
}

export async function updateParticipantProfile(
  input: ParticipantProfileInput,
): Promise<ParticipantProfile> {
  return apiFetch<ParticipantProfile>(
    "/api/v1/participant/profile",
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
}

export async function getExhibitorSubmission(): Promise<ExhibitorSubmission> {
  return apiFetch<ExhibitorSubmission>(
    "/api/v1/exhibitor/submission",
  );
}

export async function createExhibitorSubmission(): Promise<ExhibitorSubmission> {
  return apiFetch<ExhibitorSubmission>(
    "/api/v1/exhibitor/submission",
    {
      method: "POST",
    },
  );
}

export async function updateExhibitorSubmission(
  input: Partial<ExhibitorSubmission>,
): Promise<ExhibitorSubmission> {
  return apiFetch<ExhibitorSubmission>(
    "/api/v1/exhibitor/submission",
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
}

export async function addExhibitorArtwork(
  input: ArtworkInput,
): Promise<Artwork> {
  return apiFetch<Artwork>(
    "/api/v1/exhibitor/submission/artworks",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function updateExhibitorArtwork(
  id: string,
  input: Partial<ArtworkInput>,
): Promise<Artwork> {
  return apiFetch<Artwork>(
    `/api/v1/exhibitor/submission/artworks/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
}

export async function deleteExhibitorArtwork(
  id: string,
): Promise<void> {
  await apiFetch<void>(
    `/api/v1/exhibitor/submission/artworks/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}

export async function submitExhibitorSubmission(): Promise<ExhibitorSubmission> {
  return apiFetch<ExhibitorSubmission>(
    "/api/v1/exhibitor/submission/submit",
    {
      method: "POST",
    },
  );
}
