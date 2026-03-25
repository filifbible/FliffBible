/**
 * Rate limiting por IP usando Map em memória.
 * Adequado para serverless pois resets entre cold starts são aceitáveis.
 * Para ambiente multi-instância em produção, substituir por Upstash Redis.
 */

const requestMap = new Map<string, number[]>();

/**
 * @param ip     - IP da requisição
 * @param max    - Máximo de requisições permitidas na janela
 * @param windowMs - Duração da janela em ms (padrão: 1 minuto)
 * @returns true se a requisição é permitida, false se deve ser bloqueada
 */
export function rateLimit(ip: string, max = 20, windowMs = 60_000): boolean {
  const now  = Date.now();
  const hits = (requestMap.get(ip) ?? []).filter(t => now - t < windowMs);

  if (hits.length >= max) return false;

  requestMap.set(ip, [...hits, now]);
  return true;
}

/** Extrai o IP do cliente da requisição Next.js */
export function getClientIp(req: Request): string {
  const forwarded = (req as any).headers?.get?.('x-forwarded-for') as string | null;
  return forwarded?.split(',')[0]?.trim() ?? 'unknown';
}
