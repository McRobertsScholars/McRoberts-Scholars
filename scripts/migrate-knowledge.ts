import fs from "fs"
import path from "path"

async function migrateKnowledge() {
  try {
    // Read the existing knowledge.txt file
    const knowledgePath = path.join(process.cwd(), "data", "knowledge.txt")
    const knowledgeContent = fs.readFileSync(knowledgePath, "utf8")

    // Send to the API to process and store
    const response = await fetch("http://localhost:3000/api/knowledge/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: knowledgeContent,
        metadata: {
          source: "knowledge.txt",
          migrated_at: new Date().toISOString(),
        },
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to migrate knowledge")
    }

    const result = await response.json()
    console.log("Migration complete:", result)
  } catch (error) {
    console.error("Migration error:", error)
  }
}

// Run the migration
migrateKnowledge()
