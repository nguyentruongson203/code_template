import axios from "axios"

const API_BASE_URL = "https://api.fstack.io.vn/playground/api/v1"

export interface ShareResponse {
  id: string
  slug: string
  url: string
}

export async function shareCode(files: any[]): Promise<ShareResponse> {
  try {
    // Convert files to a format suitable for sharing
    const projectData = {
      files: files.map((file) => ({
        name: file.name,
        type: file.type,
        language: file.language,
        content: file.content,
        path: file.path,
      })),
      timestamp: new Date().toISOString(),
      version: "1.0",
    }

    const response = await axios.post(`${API_BASE_URL}/code`, {
      value: JSON.stringify(projectData, null, 2),
    })

    // Handle the new API response format with nested data object
    if (response.data.statusCode === 200 && response.data.data) {
      const responseData = response.data.data
      const shareSlug = responseData.slug
      const shareId = responseData.id

      return {
        id: String(shareId), // Convert to string safely
        slug: shareSlug,
        url: `${window.location.origin}/shared/${shareSlug}`,
      }
    }

    throw new Error(response.data.message || "Failed to share code")
  } catch (error) {
    console.error("Failed to share code:", error)
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to share code. Please try again.")
    }
    throw new Error("Failed to share code. Please try again.")
  }
}

export async function loadSharedCode(slug: string): Promise<any[]> {
  try {
    // Use the correct GET endpoint with slug
    const response = await axios.get(`${API_BASE_URL}/code/${slug}`)

    // Handle the new API response format with nested data object
    if (response.data.statusCode === 200 && response.data.data) {
      const responseData = response.data.data

      // Parse the value field which contains the JSON string
      if (responseData.value) {
        const projectData = JSON.parse(responseData.value)
        return projectData.files || []
      }
    }

    throw new Error(response.data.message || "Invalid shared code format")
  } catch (error) {
    console.error("Failed to load shared code:", error)
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to load shared code. The link may be invalid or expired.",
      )
    }
    throw new Error("Failed to load shared code. The link may be invalid or expired.")
  }
}

export async function getSharedCodeInfo(slug: string): Promise<{
  id: number
  slug: string
  createdAt: string
  updatedAt: string
  filesCount: number
}> {
  try {
    const response = await axios.get(`${API_BASE_URL}/code/${slug}`)

    if (response.data.statusCode === 200 && response.data.data) {
      const responseData = response.data.data
      const projectData = JSON.parse(responseData.value)

      return {
        id: responseData.id,
        slug: responseData.slug,
        createdAt: responseData.createdAt,
        updatedAt: responseData.updatedAt,
        filesCount: projectData.files?.length || 0,
      }
    }

    throw new Error("Failed to get shared code info")
  } catch (error) {
    console.error("Failed to get shared code info:", error)
    throw error
  }
}
