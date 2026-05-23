// CF_PAGES_COMMIT_SHA is injected automatically by Cloudflare Pages at build time
export async function onRequestGet({ env }) {
  return Response.json({ version: env.CF_PAGES_COMMIT_SHA ?? 'unknown' });
}
