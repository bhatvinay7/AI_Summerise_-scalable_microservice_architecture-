import axios from "axios";
import pdf from "pdf-parse";
import mammoth from "mammoth";

async function fetchFile(url: string): Promise<string> {
  const extension = (url?.split("?")?.[0] as string).toLowerCase()

  // Download file (binary)
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data);

  if (extension === "pdf") {
    const data = await pdf(buffer);
    return data.text;
  } 
  else if (extension === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } 
  else if (["txt", "json", "csv"].includes(extension || "")) {
    return buffer.toString("utf-8");
  } 
  else {
    throw new Error(`Unsupported file type: ${extension}`);
  }
}


export default fetchFile