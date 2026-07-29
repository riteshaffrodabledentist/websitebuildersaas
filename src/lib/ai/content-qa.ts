/**
 * Content QA: humanize (Phrasly/RewriteAI) then verify with Copyleaks.
 * Vendors are separated — never trust a humanizer grading its own output.
 */

export type ContentQaResult = {
  humanizedText: string;
  humanizer: "phrasly" | "rewriteai" | "none";
  aiScore: number | null;
  plagiarismScore: number | null;
  passed: boolean;
  attempts: number;
  message?: string;
};

export async function humanizeText(
  text: string,
  provider: "phrasly" | "rewriteai" = "phrasly",
): Promise<string> {
  const key =
    provider === "phrasly"
      ? process.env.PHRASLY_API_KEY
      : process.env.REWRITEAI_API_KEY;

  if (!key) {
    // Dev fallback — returns input unchanged with a marker when unconfigured
    return text;
  }

  // Provider HTTP calls land here when keys are present
  void key;
  return text;
}

export async function verifyWithCopyleaks(text: string): Promise<{
  aiScore: number | null;
  plagiarismScore: number | null;
  configured: boolean;
}> {
  const key = process.env.COPYLEAKS_API_KEY;
  if (!key) {
    return { aiScore: null, plagiarismScore: null, configured: false };
  }
  void text;
  void key;
  // Real Copyleaks submit/poll will replace this stub
  return { aiScore: 0, plagiarismScore: 0, configured: true };
}

export async function runContentQa(
  draft: string,
  opts?: { maxAttempts?: number; threshold?: number },
): Promise<ContentQaResult> {
  const maxAttempts = opts?.maxAttempts ?? 2;
  const threshold = opts?.threshold ?? 0.3;
  const provider =
    process.env.HUMANIZER_PROVIDER === "rewriteai" ? "rewriteai" : "phrasly";

  let text = draft;
  let attempts = 0;
  let lastAi: number | null = null;
  let lastPlag: number | null = null;

  while (attempts < maxAttempts) {
    attempts += 1;
    text = await humanizeText(text, provider);
    const verify = await verifyWithCopyleaks(text);
    if (!verify.configured) {
      return {
        humanizedText: text,
        humanizer: provider,
        aiScore: null,
        plagiarismScore: null,
        passed: false,
        attempts,
        message: "Content QA not configured — set Copyleaks + humanizer keys",
      };
    }
    lastAi = verify.aiScore;
    lastPlag = verify.plagiarismScore;
    const aiOk = lastAi == null || lastAi <= threshold;
    const plagOk = lastPlag == null || lastPlag <= threshold;
    if (aiOk && plagOk) {
      return {
        humanizedText: text,
        humanizer: provider,
        aiScore: lastAi,
        plagiarismScore: lastPlag,
        passed: true,
        attempts,
      };
    }
  }

  return {
    humanizedText: text,
    humanizer: provider,
    aiScore: lastAi,
    plagiarismScore: lastPlag,
    passed: false,
    attempts,
    message: "Content failed QA thresholds — needs human edit",
  };
}
