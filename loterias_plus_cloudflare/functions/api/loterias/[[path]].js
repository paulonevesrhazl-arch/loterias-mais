
const ALLOWED = new Set([
  "megasena",
  "lotofacil",
  "quina",
  "lotomania",
  "duplasena",
  "timemania",
  "diadesorte",
  "maismilionaria",
  "supersete"
]);

const HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=60, s-maxage=120",
  "Access-Control-Allow-Origin": "*"
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: HEADERS,
    body: JSON.stringify(body)
  };
}

async function consultar(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 LoteriasMais/1.0"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    const data = await response.json();

    if (!data || typeof data !== "object") {
      throw new Error("Resposta inválida");
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

  const urls = [
    "https://loteriascaixa-api.herokuapp.com/api/" +
      code + "/" + (contest || "latest"),
    "https://api.guidi.dev.br/loteria/" +
      code + "/" + (contest || "ultimo"),
    "https://servicebus2.caixa.gov.br/portaldeloterias/api/" +
      code + (contest ? "/" + contest : "")
  ];

  const errors = [];

  for (const url of urls) {
    try {
      const data = await consultar(url);

      const numero =
        data.concurso ||
        data.numero ||
        data.numeroConcurso;

      const dezenas =
        data.dezenas ||
        data.listaDezenas ||
        data.dezenasSorteadasOrdemSorteio;

      if (!numero || !Array.isArray(dezenas) || !dezenas.length) {
        throw new Error("A resposta não contém concurso e dezenas");
      }

      // Normaliza os campos para o site.
      const normalized = {
        ...data,
        numero,
        listaDezenas: dezenas,
        dataApuracao: data.dataApuracao || data.data || null,
        valorEstimadoProximoConcurso:
          data.valorEstimadoProximoConcurso ?? null
      };

      return json(200, {
        source: url.includes("herokuapp.com")
          ? "API alternativa"
          : url.includes("guidi.dev.br")
            ? "Guidi"
            : "Caixa",
        fetchedAt: new Date().toISOString(),
        data: normalized
      });
    } catch (error) {
      errors.push(error.message || "Falha na consulta");
    }
  }

  return json(502, {
    error: "Não foi possível obter o resultado.",
    details: errors
  });
};
