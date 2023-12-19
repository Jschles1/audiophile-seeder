import { ImageObject } from "./interfaces";

const cloudflareBaseUrl = `https://api.cloudflare.com/client/v4/accounts/${process.env["CLOUDFLARE_ACCOUNT_ID"]}/images/v1`;
const cloudflareBearerToken = process.env["CLOUDFLARE_API_TOKEN"];

async function uploadImage(filePath: string): Promise<string> {
  // Create a BunFile instance for the image
  const image = Bun.file(filePath);

  // Read the image as an ArrayBuffer
  const imageData = await image.arrayBuffer();

  // Generate a random boundary for the multipart/form-data
  const boundary =
    "----WebKitFormBoundary" + Math.random().toString(36).substring(2);

  // Convert ArrayBuffer to Buffer
  const buffer = Buffer.from(imageData);

  // Construct the multipart body parts
  let requestDataBeforeFile = "";
  requestDataBeforeFile += `--${boundary}\r\n`;
  requestDataBeforeFile += `Content-Disposition: form-data; name="file"; filename="${filePath
    .split("/")
    .pop()}"\r\n`;
  requestDataBeforeFile += `Content-Type: ${image.type}\r\n\r\n`;

  let requestDataAfterFile = "\r\n";
  requestDataAfterFile += `--${boundary}--`;

  // Convert the parts to Buffer
  const beforeBuffer = Buffer.from(requestDataBeforeFile, "binary");
  const afterBuffer = Buffer.from(requestDataAfterFile, "binary");

  // Combine all parts into one Buffer
  const requestData = Buffer.concat([beforeBuffer, buffer, afterBuffer]);

  // Set up the headers
  const headers = {
    Authorization: `Bearer ${cloudflareBearerToken}`,
    "Content-Type": `multipart/form-data; boundary=${boundary}`,
  };

  // Sending the POST request
  try {
    const response = await fetch(cloudflareBaseUrl, {
      method: "POST",
      headers: headers,
      body: requestData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload: ${response.status}`);
    }

    const json = await response.json();

    if (!json.result) {
      throw new Error(`Failed to upload: ${json.errors}`);
    }

    const cloudflareUrl = json.result.variants[0];
    console.log("Image uploaded successfully.");
    return cloudflareUrl as string;
  } catch (error: any) {
    console.error("Error uploading image:", error?.message);
    return "";
  }
}

export default async function groupUploadImages(
  imageObject: ImageObject,
  callback: (urls: string[]) => void
) {
  const { mobile, desktop, tablet } = imageObject;
  const images = [mobile, tablet, desktop];
  const imagePromises = images.map((image) => uploadImage(image as string));
  await Promise.all(imagePromises)
    .then((urls) => callback(urls))
    .catch((e) => {
      throw new Error("Error uploading images: ", e);
    });
}
