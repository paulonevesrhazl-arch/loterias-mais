const ALLOWED = new Set(['megasena','lotofacil','quina','lotomania','duplasena','timemania','diadesorte','maismilionaria','supersete','federal','loteca']);
export async function onRequest({ request, params }) {
  const raw = Array.isArray(params.path) ? params.path : [params.path].filter(Boolean);
  const code = (raw[0] || '').toLowerCase();
  const contest = raw[1] || '';
  if (!ALLOWED.has(code) || (contest && !/^\d+$/.test(contest))) return Response.json({error:'Loteria ou concurso inválido.'},{status:400});
  const target = `https://servicebus2.caixa.gov.br/portaldeloterias/api/${code}${contest ? '/' + contest : ''}`;
  try {
    const upstream = await fetch(target,{headers:{'Accept':'application/json, text/plain, */*','User-Agent':'Mozilla/5.0 (compatible; LoteriasPlus/1.0)','Referer':'https://loterias.caixa.gov.br/'},signal:AbortSignal.timeout(12000)});
    if (!upstream.ok) return Response.json({error:`A Caixa respondeu com status ${upstream.status}.`},{status:upstream.status});
    const data = await upstream.json();
    return Response.json({source:'Caixa',fetchedAt:new Date().toISOString(),data},{headers:{'Cache-Control':'public, max-age=60, s-maxage=120'}});
  } catch (e) { return Response.json({error:'Não foi possível consultar a Caixa neste momento.',details:String(e)},{status:502}); }
}
