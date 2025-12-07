# Capture Image

## Endpoint
`POST /upload-image`

## Request Body
```json
{
  "base64_jpg": "<base64-encoded JPEG string>"
}
```
- Must be a non-empty string representing raw JPEG bytes encoded with Base64 (no data URL prefix expected).

## Behavior
1. The server decodes `base64_jpg` and uploads it to the Supabase storage bucket `food-images` via `uploadJpgToStorage`.
2. Files are stored under `public/image_<random 4-digit>.jpg`.
3. The response embeds the public URL returned by Supabase.

## Responses
- **Success (200)**
  ```json
  {
    "message": "Image uploaded successfully",
    "path": "https://<supabase-storage-domain>/storage/v1/object/public/food-images/public/image_1234.jpg"
  }
  ```
- **Client error (400)** when `base64_jpg` is missing or blank.
- **Upstream/storage failure (502)** with `{"error": "Failed to upload image", "details": "<supabase error>"}`.
