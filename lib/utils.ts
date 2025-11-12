import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { filesAPI } from "./api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const fileUploader = async (file: any, folderPath?: any) => {
  const formData = new FormData();
  formData.append("document", file);
  console.log("formData", formData);

  try {
    const response = await filesAPI.upload(formData, folderPath);
    console.log("filesAPI.upload", response);

    if (response) {
      return response;
    }
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

// return bucket url  process.env.NEXT_PUBLIC_S3_URL + key
export const getS3Url = (key: string) => {
  // if key is null or undefined, return ""
  if (!key) {
    return "";
  }
  // if key starts with "https://", return key
  if (key.startsWith("https://")) {
    return key;
  }
  // otherwise, return process.env.NEXT_PUBLIC_S3_URL + key if doesn't start with "/"
  if (!key.startsWith("/")) {
    return process.env.NEXT_PUBLIC_S3_URL + "/" + key;
  }
  return process.env.NEXT_PUBLIC_S3_URL + key;
};
