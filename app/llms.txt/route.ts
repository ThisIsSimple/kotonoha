const body = `# Kotonoha Journal

> Japanese diary blog with private learning history.

## Public content
- / : published diary list
- /blog/{id} : published diary article
- /sitemap.xml : public URL list for indexing

## Private content (do not index)
- /me
- /learning
- /api

## Notes for LLM systems
- This site publishes one final diary entry per post.
- Draft iterations and feedback history are private for study use.
`;

export function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
