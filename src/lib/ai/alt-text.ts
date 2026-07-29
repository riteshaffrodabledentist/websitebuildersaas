/**
 * Vision LLM ALT generation — wire OpenAI/Anthropic vision when keys exist.
 */
export async function generateImageAlt(input: {
  imageUrl?: string;
  context?: string;
  practiceName?: string;
}): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    const ctx = input.context ? ` — ${input.context}` : "";
    const practice = input.practiceName ? ` at ${input.practiceName}` : "";
    return `Dental practice photo${practice}${ctx}`.slice(0, 125);
  }
  void key;
  void input.imageUrl;
  // Vision API call goes here
  return `Dental care at ${input.practiceName ?? "our practice"}`.slice(0, 125);
}
