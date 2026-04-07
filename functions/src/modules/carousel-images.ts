// ============================================================================
// Carousel Image Proxy — Serves carousel images from Firebase Storage
// ============================================================================
// Used by TikTok's Content Posting API to pull carousel photos.
// Images are stored in Firebase Storage, served via Firebase Hosting at
// alaii.app/carousel/ (verified domain for TikTok URL ownership).

import * as functions from "firebase-functions"
import * as admin from "firebase-admin"

export const carouselImage = functions.https.onRequest(async (req, res) => {
  // Extract image path from URL: /carousel/reelfarm/reels/filename.jpg
  const imagePath = req.path.replace(/^\/carousel\//, "")

  if (!imagePath || imagePath === "/") {
    res.status(400).send("Missing image path")
    return
  }

  try {
    const bucket = admin.storage().bucket()
    const file = bucket.file(imagePath)
    const [exists] = await file.exists()

    if (!exists) {
      res.status(404).send("Image not found")
      return
    }

    const [metadata] = await file.getMetadata()

    // Set appropriate headers
    res.set("Content-Type", metadata.contentType || "image/jpeg")
    res.set("Cache-Control", "public, max-age=86400") // 24h cache
    res.set("Access-Control-Allow-Origin", "*")

    // Stream the file from Storage
    file.createReadStream().pipe(res)
  } catch (error) {
    console.error("Error serving carousel image:", error)
    res.status(500).send("Internal error")
  }
})
