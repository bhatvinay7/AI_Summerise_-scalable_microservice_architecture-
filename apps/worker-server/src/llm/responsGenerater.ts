import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function fetchResponse(content:string) {
  const chatCompletion = await getGroqChatCompletion(content);
  return chatCompletion?.choices?.[0]?.message.content
}

export async function getGroqChatCompletion(content:string) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `${content} ${"summerise the content according to given context.Always verify the data not give any falsy information. Assign the appropriate  session name for user mentioned content.Response should be key value pair which must contain response and sessionName fields where response should be text or markdown .If the content is not related or context is not given respond with general answer and the response should always be in key value pair format with response and sessionName fields."}`,
      },
    ],
    model: "openai/gpt-oss-20b",
  });
}
