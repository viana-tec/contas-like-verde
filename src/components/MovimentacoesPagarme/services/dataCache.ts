
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class DataCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutos

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    console.log(`📦 Cache armazenado: ${key} (TTL: ${ttl}ms)`);
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const isExpired = (Date.now() - entry.timestamp) > entry.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      console.log(`⏰ Cache expirado removido: ${key}`);
      return null;
    }

    console.log(`✅ Cache encontrado: ${key}`);
    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
    console.log('🗑️ Cache limpo');
  }

  remove(key: string): void {
    this.cache.delete(key);
    console.log(`🗑️ Cache removido: ${key}`);
  }

  // Gerar chave de cache baseada na API key e período
  generateKey(apiKey: string, endpoint?: string): string {
    const today = new Date().toISOString().split('T')[0];
    const keyHash = btoa(apiKey).substring(0, 8);
    return `${keyHash}_${endpoint || 'all'}_${today}`;
  }

  // Limpar cache antigo (mais de 24h)
  cleanupOldCache(): void {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    for (const [key, entry] of this.cache.entries()) {
      if ((now - entry.timestamp) > oneDayMs) {
        this.cache.delete(key);
        console.log(`🧹 Cache antigo removido: ${key}`);
      }
    }
  }
}

export const dataCache = new DataCache();

// Limpar cache antigo a cada hora
setInterval(() => {
  dataCache.cleanupOldCache();
}, 60 * 60 * 1000);
