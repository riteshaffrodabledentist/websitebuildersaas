export function generateRobotsTxt(input: {
  domain: string;
  extraRules?: string | null;
}): string {
  const sitemap = `Sitemap: https://${input.domain}/sitemap.xml`;
  const base = `User-agent: *
Allow: /
Disallow: /agency
Disallow: /client
Disallow: /api
`;
  const extra = input.extraRules?.trim() ? `\n${input.extraRules.trim()}\n` : "\n";
  return `${base}${extra}${sitemap}\n`;
}
