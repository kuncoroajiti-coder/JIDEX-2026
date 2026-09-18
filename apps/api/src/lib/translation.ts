import { z } from "zod";

const translationResponseSchema = z.object({
  responseStatus: z.number().optional(),
  responseData: z
    .object({
      translatedText: z.string(),
    })
    .optional(),
});

export async function translateIdToEn(text: string): Promise<string> {
  const trimmed = text.trim();

  if (!trimmed) {
    return "";
  }

  const params = new URLSearchParams({
    q: trimmed,
    langpair: "id|en",
  });

  const response = await fetch(
    `https://api.mymemory.translated.net/get?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "JIDEX-2026/1.0",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Translation provider returned HTTP ${response.status}`,
    );
  }

  const data: unknown = await response.json();
  const parsed = translationResponseSchema.safeParse(data);

  if (!parsed.success || !parsed.data.responseData?.translatedText) {
    throw new Error("Translation provider returned invalid data");
  }

  if (
    parsed.data.responseStatus !== undefined &&
    parsed.data.responseStatus !== 200
  ) {
    throw new Error(
      `Translation provider returned status ${parsed.data.responseStatus}`,
    );
  }

  return parsed.data.responseData.translatedText.trim();
}

export async function translateOptionalIdToEn(
  text: string | null | undefined,
): Promise<string | null> {
  if (!text?.trim()) {
    return null;
  }

  return translateIdToEn(text);
}
