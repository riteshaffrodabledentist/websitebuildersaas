export type LlmsLink = { title: string; url: string; description?: string };

export function generateLlmsTxt(input: {
  practiceName: string;
  summary?: string | null;
  phone?: string | null;
  address?: string | null;
  links: LlmsLink[];
}): string {
  const lines = [
    `# ${input.practiceName}`,
    "",
    `> ${input.summary?.trim() || `Dental practice website for ${input.practiceName}.`}`,
    "",
  ];

  if (input.phone) lines.push(`- Phone: ${input.phone}`);
  if (input.address) lines.push(`- Address: ${input.address}`);
  if (input.phone || input.address) lines.push("");

  lines.push("## Pages", "");
  for (const link of input.links) {
    const desc = link.description ? `: ${link.description}` : "";
    lines.push(`- [${link.title}](${link.url})${desc}`);
  }
  lines.push("");
  return lines.join("\n");
}
