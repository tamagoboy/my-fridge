import vision from '@google-cloud/vision'

function getVisionClient() {
  const rawCredentials = process.env.GOOGLE_CLOUD_VISION_CREDENTIALS

  if (rawCredentials) {
    return new vision.ImageAnnotatorClient({
      credentials: JSON.parse(rawCredentials),
    })
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return new vision.ImageAnnotatorClient()
  }

  return null
}

export async function extractReceiptTextFromImage(buffer: Buffer) {
  const client = getVisionClient()

  if (!client) {
    return null
  }

  try {
    const [result] = await client.textDetection({ image: { content: buffer } })
    return result.fullTextAnnotation?.text ?? result.textAnnotations?.[0]?.description ?? null
  } catch {
    return null
  }
}
