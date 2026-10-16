
const ALLOWED = new Set([
  "megasena", "lotofacil", "quina", "lotomania", "duplasena",
  "timemania", "diadesorte", "maismilionaria", "supersete",
  "federal", "loteca"
]);

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=60, s-maxage=120",
    "Access-Control-Allow-Origin": "*"
  },
  body: JSON.stringify(body)
});

async function consultar(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; LoteriasMais/1.0)",
        "Referer": "https://loterias.caixa.gov.br/"
      },
      signal: controller.signal
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("A fonte retornou conteúdo que não é JSON");
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Formato de resposta inesperado");
    }

    return data;
  } finally {
    clearTimeout(timer);
  }
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const code = String(params.loteria || "").toLowerCase();
  const contest = String(params.concurso || "").trim();

  if (!ALLOWED.has(code) || (contest && !/^\d+$/.test(contest))) {
    return json(400, {
      error: "Loteria ou número de concurso inválido."
    });
  }

  const caixaUrl =
    `https://servicebus2.caixa.gov.br/portaldeloterias/api/${code}` +
    (contest ? `/${contest}` : "");

  const guidiUrl =
    `https://api.guidi.dev.br/loteria/${code}/` +
    (contest || "ultimo");

  const errors = [];

  // 1. Tenta consultar a Caixa.
  try {
    const data = await consultar(caixaUrl);

    if (!data.numero && !data.numeroConcurso) {
      throw new Error("Resposta da Caixa sem número de concurso");
    }

    return json(200, {
      source: "Caixa",
      fetchedAt: new Date().toISOString(),
      data
    });
  } catch (error) {
    errors.push(`Caixa: ${error.message}`);
  }

  // 2. Se a Caixa falhar, tenta a API alternativa.
  try {
    const data = await consultar(guidiUrl);

    if (!data.numero && !data.numeroConcurso) {
      throw new Error("Resposta alternativa sem número de concurso");
    }

    return json(200, {
      source: "Guidi (fonte alternativa)",
      fetchedAt: new Date().toISOString(),
      data
    });
  } catch (error) {
    errors.push(`Fonte alternativa: ${error.message}`);
  }

  // 3. Se ambas falharem, informa o problema sem inventar resultados.
  return json(502, {
    error: "Não foi possível consultar os resultados em nenhuma das fontes.",
    details: errors
  });
};
