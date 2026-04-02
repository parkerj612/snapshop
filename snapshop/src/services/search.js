const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export async function searchProducts(query) {
  const systemPrompt = `You are a product price comparison engine. Given a product query, search the web for that exact product and return real pricing from multiple retailers.

Return ONLY valid JSON — no markdown fences, no preamble, no explanation. Use this exact schema:
{
  "productName": "Canonical product name",
  "category": "Category",
  "results": [
    {
      "name": "Product name with variant/color/size if relevant",
      "price": 99.99,
      "originalPrice": 129.99,
      "store": "Retailer name",
      "rating": 4.5,
      "reviews": 1200,
      "url": "https://direct-product-url",
      "inStock": true
    }
  ]
}

Rules:
- Return 3-8 results from DIFFERENT retailers when possible (Amazon, Best Buy, Walmart, Target, manufacturer site, etc.)
- Sort by price ascending (cheapest first)
- Use real current prices from web search results
- Include the direct product URL when found
- If a product has multiple variants (colors, sizes, storage), pick the most common/base variant
- originalPrice should be the MSRP or list price if different from the sale price
- If you cannot find real prices, give your best estimate clearly based on known retail pricing`;

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: `Find current retail prices for: ${query}` }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Search API error: ${res.status}`);
  }

  const data = await res.json();

  // Extract text from potentially multiple content blocks
  const textParts = data.content
    ?.filter(b => b.type === "text")
    .map(b => b.text)
    .join("\n") || "";

  if (!textParts) throw new Error("No results returned from search");

  // Clean and parse JSON
  const clean = textParts.replace(/```json|```/g, "").trim();

  // Try to find JSON object in the response
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse search results");

  const parsed = JSON.parse(jsonMatch[0]);

  // Sort by price
  if (parsed.results) {
    parsed.results.sort((a, b) => a.price - b.price);
  }

  return parsed;
}
