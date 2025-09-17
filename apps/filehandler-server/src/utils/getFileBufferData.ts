import axios from "axios";
import pdf from "pdf-parse";
import mammoth from "mammoth";

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB


async function fetchFile(url: string): Promise<string> {
  const extension = (url?.split("?")?.[0] as string).toLowerCase()
  
  // Download file (binary)
  const response = await axios.get(url, { responseType: "arraybuffer" });
  if (response.data.byteLength > MAX_SIZE) {
    throw new Error("Response too large (>20 MB)");
  }
  const buffer = Buffer.from(response.data);

  if (extension === "pdf") {
    const data = await pdf(buffer);
    return data.text;
  } 
  else if (extension === "officedocument") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } 
  else if (["txt", "json", "csv"].includes(extension || "")) {
    return buffer.toString("utf-8");
  } 
  else {
   return response.data.toString("utf-8");
  }
}


export default fetchFile