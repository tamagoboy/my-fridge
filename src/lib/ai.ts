type JsonSchema = Record<string, unknown>

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY ?? process.env.AI_API_KEY ?? null
}

export async function generateStructuredContent<T>({
  systemPrompt,
  userPrompt,
  responseSchema,
}: {
  systemPrompt: string
  userPrompt: string
  responseSchema: JsonSchema
}): Promise<T | null> {
  const apiKey = getGeminiApiKey()

  if (!apiKey) {
    return null
  }

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.2,
        },
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
      }),
    })

    if (!response.ok) {
      return null
    }

    const payload = await response.json()
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      return null
    }

    return JSON.parse(text) as T
  } catch {
    return null
  }
}
