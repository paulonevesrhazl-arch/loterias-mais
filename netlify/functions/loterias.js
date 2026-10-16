// Netlify Function: consulta a API pública da Caixa e devolve sempre JSON.
const ALLOWED = new Set([
  'megasena', 'lotofacil', 'quina', 'lotomania', 'duplasena',
  'timemania', 'diadesorte', 'maismilionaria', 'supersete', 'federal', 'loteca'
]);

exports.handler = async (event) => {
  const code = String(event.queryStringParameters?.loteria || '').toLowerCase();
  const contest = String(event.queryStringParameters?.concurso || '');
  const json = (statusCode, body, extraHeaders = {}) => ({
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=120',
      'Access-Control-Allow-Origin': '*',
      ...extraHeaders
    },
    body: JSON.stringify(body)
  });

  if (!ALLOWED.has(code) || (contest && !/^\d+$/.test(contest))) {
    return json(400, { error: 'Loteria ou número de concurso inválido.' });
  }

  const target = `https://servicebus2.caixa.gov.br/portaldeloterias/api/${code}${contest ? `/${contest}` : ''}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const upstream = await fetch(target, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (compatible; LoteriasPlus/1.0)',
        'Referer': 'https://loterias.caixa.gov.br/'
      },
      signal: controller.signal
    });
    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); }
    catch (_) {
      return json(502, { error: 'A Caixa não retornou dados JSON válidos. Tente novamente mais tarde.' });
    }
    if (!upstream.ok) {
      return json(upstream.status, { error: `A Caixa respondeu com status ${upstream.status}.` });
    }
    return json(200, { source: 'Caixa', fetchedAt: new Date().toISOString(), data });
  } catch (error) {
    return json(502, { error: error?.name === 'AbortError'
      ? 'A consulta à Caixa demorou demais. Tente novamente.'
      : 'Não foi possível consultar a Caixa neste momento.' });
  } finally {
    clearTimeout(timer);
  }
};
