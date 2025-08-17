import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function fetchResponse(content:string) {
  const chatCompletion = await getGroqChatCompletion(content);
  return chatCompletion.choices[0]?.message?.content || "";
}

export async function getGroqChatCompletion(content:string) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `${content}`,
      },
    ],
    model: "openai/gpt-oss-20b",
  });
}
