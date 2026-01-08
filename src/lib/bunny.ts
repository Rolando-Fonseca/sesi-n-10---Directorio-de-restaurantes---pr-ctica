
/**
 * Bunny.net Storage & CDN Integration
 * 
 * Required Environment Variables in .env.local:
 * - BUNNY_STORAGE_API_KEY: Your storage zone API key (Password)
 * - BUNNY_STORAGE_ZONE_NAME: The name of your storage zone (e.g. "foodzinder-team-a")
 * - BUNNY_STORAGE_REGION: (Optional) Region code if not main (e.g. "la", "ny", "sg"). Leave empty for standard.
 * - BUNNY_PULL_ZONE_URL: Your CDN URL (e.g. "https://foodzinder-team-a.b-cdn.net")
 */

export async function uploadImageToBunny(file: File | Buffer, filename?: string): Promise<string> {
  const apiKey = process.env.BUNNY_STORAGE_API_KEY;
  const storageZoneName = process.env.BUNNY_STORAGE_ZONE_NAME;
  const region = process.env.BUNNY_STORAGE_REGION; // e.g. "la" or empty
  const pullZoneUrl = process.env.BUNNY_PULL_ZONE_URL;

  if (!apiKey || !storageZoneName || !pullZoneUrl) {
    throw new Error("Missing Bunny.net configuration variables");
  }

  // Determine endpoint based on region
  // Main endpoint: storage.bunnycdn.com
  // Geo endpoints: {region}.storage.bunnycdn.com
  const baseUrl = region 
    ? `https://${region}.storage.bunnycdn.com` 
    : "https://storage.bunnycdn.com";

  // Generate a safe unique filename if not provided
  const finalFilename = filename || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
  
  // Construct Upload URL
  const uploadUrl = `${baseUrl}/${storageZoneName}/${finalFilename}`;

  // Prepare body
  let body: BodyInit;
  if (file instanceof File) {
    body = file;
  } else {
    body = file;
  }

  try {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        AccessKey: apiKey,
        "Content-Type": "application/octet-stream", // Bunny detects type automatically or treats as binary
      },
      body: body,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Bunny upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Return the public CDN URL
    // Ensure pullZoneUrl doesn't have a trailing slash and filename doesn't have a leading slash if we join them manually, 
    // or just handle it cleanly.
    const cleanBase = pullZoneUrl.replace(/\/$/, "");
    return `${cleanBase}/${finalFilename}`;
    
  } catch (error) {
    console.error("Error uploading to Bunny.net:", error);
    throw error;
  }
}
