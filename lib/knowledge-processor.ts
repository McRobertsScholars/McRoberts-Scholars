export function chunkText(text: string, maxChunkSize = 1000): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/)
  const chunks: string[] = []
  let currentChunk = ""

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

export function extractMetadata(chunk: string): Record<string, any> {
  const metadata: Record<string, any> = {}

  // Extract dates
  const dateMatch = chunk.match(/\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})\b/)
  if (dateMatch) {
    metadata.date = dateMatch[0]
  }

  // Extract scholarship names (assuming they're in title case or all caps)
  const scholarshipMatch = chunk.match(/\b[A-Z][A-Za-z\s]+(?:Scholarship|Grant|Award|Competition)\b/g)
  if (scholarshipMatch) {
    metadata.scholarships = scholarshipMatch
  }

  // Extract amounts
  const amountMatch = chunk.match(/\$[\d,]+(?:\.\d{2})?/g)
  if (amountMatch) {
    metadata.amounts = amountMatch
  }

  // Extract topics
  const topics = []
  if (chunk.toLowerCase().includes("stem")) topics.push("STEM")
  if (chunk.toLowerCase().includes("essay")) topics.push("Essay")
  if (chunk.toLowerCase().includes("leadership")) topics.push("Leadership")
  if (chunk.toLowerCase().includes("community")) topics.push("Community Service")
  if (chunk.toLowerCase().includes("art")) topics.push("Arts")

  if (topics.length > 0) {
    metadata.topics = topics
  }

  return metadata
}
