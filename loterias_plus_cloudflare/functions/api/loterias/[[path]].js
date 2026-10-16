
export async function onRequest(context) {
  const { request, params } = context;
  const url = new URL(request.url);
  const path = params.caminho;
  const parts = Array.isArray(path) ? path : [path];
  const allowed = [
    "megasena", "lotofacil", "quina", "lotomania",
    "duplasena", "timemania", "diadesorte",
    "maismilionaria", "supersete"
  ];

  if (!parts[0] || !allowed.includes(parts[0].toLowerCase())) {
    return new Response(
      JSON.stringify({ error: "Loteria inválida." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const target =
    "https://servicebus2.caixa.gov.br/portaldeloterias/api/" +
    parts.map(encodeURIComponent).join("/");

  try {
    const response = await fetch(target, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://loterias.caixa.gov.br/"
      }
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Falha ao consultar a Caixa." }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
}
