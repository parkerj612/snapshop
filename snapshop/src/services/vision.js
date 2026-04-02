const VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate";

export async function identifyProduct(base64Image, apiKey) {
  const body = {
    requests: [{
      image: { content: base64Image },
      features: [
        { type: "LABEL_DETECTION", maxResults: 10 },
        { type: "LOGO_DETECTION", maxResults: 5 },
        { type: "WEB_DETECTION", maxResults: 10 },
        { type: "OBJECT_LOCALIZATION", maxResults: 5 },
      ],
    }],
  };

  const res = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Vision API error: ${res.status}`);
  }

  const data = await res.json();
  const response = data.responses?.[0];
  if (!response) throw new Error("No response from Vision API");

  const labels = (response.labelAnnotations || []).map(l => l.description);
  const logos = (response.logoAnnotations || []).map(l => l.description);
  const objects = (response.localizedObjectAnnotations || []).map(o => o.name);
  const webEntities = (response.webDetection?.webEntities || [])
    .filter(e => e.score > 0.5)
    .map(e => e.description)
    .filter(Boolean);
  const bestGuess = response.webDetection?.bestGuessLabels?.[0]?.label || "";
  const pagesWithImages = (response.webDetection?.pagesWithMatchingImages || [])
    .map(p => p.pageTitle).filter(Boolean);
  const visuallySimilar = (response.webDetection?.visuallySimilarImages || [])
    .map(i => i.url).slice(0, 3);

  return {
    bestGuess,
    labels: labels.slice(0, 6),
    logos,
    objects,
    webEntities: webEntities.slice(0, 6),
    pageTitles: pagesWithImages.slice(0, 3),
    visuallySimilar,
  };
}

export async function testApiKey(apiKey) {
  try {
    const res = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [{
          image: { content: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" },
          features: [{ type: "LABEL_DETECTION", maxResults: 1 }],
        }],
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
