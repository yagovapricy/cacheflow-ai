import { RequestLog, CacheRule, ApiKey, RegionPOP } from '../types/cacheflow';

export const INITIAL_POPS: RegionPOP[] = [
  { code: 'IAD', name: 'US East (Ashburn)', country: 'US', latencyMs: 8.2, hitRate: 91.4, rps: 1140, status: 'optimal' },
  { code: 'FRA', name: 'EU Central (Frankfurt)', country: 'DE', latencyMs: 11.5, hitRate: 89.2, rps: 680, status: 'optimal' },
  { code: 'LHR', name: 'EU West (London)', country: 'UK', latencyMs: 12.1, hitRate: 88.6, rps: 420, status: 'optimal' },
  { code: 'SJC', name: 'US West (San Jose)', country: 'US', latencyMs: 9.4, hitRate: 93.1, rps: 510, status: 'optimal' },
  { code: 'NRT', name: 'AP Northeast (Tokyo)', country: 'JP', latencyMs: 14.8, hitRate: 86.8, rps: 290, status: 'optimal' },
  { code: 'SIN', name: 'AP Southeast (Singapore)', country: 'SG', latencyMs: 16.2, hitRate: 84.7, rps: 195, status: 'optimal' },
];

export const INITIAL_REQUESTS: RequestLog[] = [
  {
    id: 'req_01HP9Z8K3J2R8',
    timestamp: '23:14:28.192',
    timeMs: Date.now() - 2100,
    method: 'GET',
    statusCode: 200,
    path: '/api/v1/catalog/products/prod_88291',
    cacheOutcome: 'HIT',
    latencyMs: 11,
    originLatencyMs: 194,
    costSaved: 0.00014,
    clientIp: '198.51.100.42',
    pop: 'IAD',
    headers: {
      'x-cacheflow-status': 'HIT',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
      'cf-edge-pop': 'IAD-01',
      'etag': 'W/"9942a-821f98"',
      'content-type': 'application/json; charset=utf-8',
      'x-origin-latency': '194ms (saved)',
      'x-cacheflow-ttl-remaining': '3420s'
    },
    responsePayload: {
      id: 'prod_88291',
      title: 'Ultra-Low Latency Edge Gateway Mod 4',
      sku: 'GW-MOD4-ENT',
      price: 1290.00,
      currency: 'USD',
      in_stock: true,
      inventory_count: 842,
      origin_cached_at: '2026-11-06T23:11:04Z'
    },
    ttlRemainingSec: 3420
  },
  {
    id: 'req_01HP9Z8H1T4P9',
    timestamp: '23:14:27.810',
    timeMs: Date.now() - 3400,
    method: 'GET',
    statusCode: 200,
    path: '/api/v1/pricing/realtime/FX_USD_EUR',
    cacheOutcome: 'HIT',
    latencyMs: 8,
    originLatencyMs: 165,
    costSaved: 0.00012,
    clientIp: '203.0.113.88',
    pop: 'FRA',
    headers: {
      'x-cacheflow-status': 'HIT',
      'cache-control': 'public, max-age=60, s-maxage=300',
      'cf-edge-pop': 'FRA-02',
      'etag': 'W/"5512b-11c"',
      'content-type': 'application/json',
      'x-cacheflow-ttl-remaining': '42s'
    },
    responsePayload: {
      pair: 'USD/EUR',
      rate: 0.9241,
      spread: 0.00008,
      timestamp: 1730934867,
      market_source: 'ECB_DIRECT'
    },
    ttlRemainingSec: 42
  },
  {
    id: 'req_01HP9Z8D7E3A1',
    timestamp: '23:14:26.940',
    timeMs: Date.now() - 5200,
    method: 'POST',
    statusCode: 200,
    path: '/graphql?op=SearchInventory',
    cacheOutcome: 'HIT',
    latencyMs: 14,
    originLatencyMs: 280,
    costSaved: 0.00021,
    clientIp: '192.0.2.147',
    pop: 'SJC',
    headers: {
      'x-cacheflow-status': 'HIT',
      'cache-control': 'public, max-age=600',
      'cf-edge-pop': 'SJC-01',
      'x-query-hash': 'sha256:7e8d89a9f24',
      'content-type': 'application/json'
    },
    responsePayload: {
      data: {
        inventorySearch: {
          totalMatches: 42,
          warehouses: ['us-east-1', 'us-west-2', 'eu-west-1'],
          execution_strategy: 'EDGE_SYNCHRONIZED'
        }
      }
    },
    ttlRemainingSec: 512
  },
  {
    id: 'req_01HP9Z8A5C8K2',
    timestamp: '23:14:25.401',
    timeMs: Date.now() - 7900,
    method: 'POST',
    statusCode: 200,
    path: '/api/v1/orders/checkout/calculate-tax',
    cacheOutcome: 'MISS',
    latencyMs: 218,
    originLatencyMs: 218,
    costSaved: 0,
    clientIp: '198.51.100.99',
    pop: 'IAD',
    headers: {
      'x-cacheflow-status': 'MISS',
      'cache-control': 'no-cache, private',
      'cf-edge-pop': 'IAD-03',
      'x-origin-fetch-reason': 'dynamic-cart-hash-mismatch',
      'content-type': 'application/json'
    },
    responsePayload: {
      tax_total: 14.82,
      jurisdiction: 'US-VA-FAIRFAX',
      calculated_at: '2026-11-06T23:14:25Z',
      cached: false
    },
    ttlRemainingSec: 0
  },
  {
    id: 'req_01HP9Z7V9N2B4',
    timestamp: '23:14:24.110',
    timeMs: Date.now() - 9800,
    method: 'GET',
    statusCode: 304,
    path: '/api/v1/navigation/taxonomy-tree',
    cacheOutcome: 'HIT',
    latencyMs: 5,
    originLatencyMs: 142,
    costSaved: 0.00010,
    clientIp: '203.0.113.15',
    pop: 'LHR',
    headers: {
      'x-cacheflow-status': 'HIT',
      'etag': 'W/"taxonomy-v4.1.2"',
      'cf-edge-pop': 'LHR-01',
      'cache-control': 'public, max-age=86400, stale-while-revalidate=604800'
    },
    responsePayload: {
      message: '304 Not Modified - Valid Client Cache ETag'
    },
    ttlRemainingSec: 74200
  },
  {
    id: 'req_01HP9Z7R4M9L1',
    timestamp: '23:14:22.650',
    timeMs: Date.now() - 12400,
    method: 'GET',
    statusCode: 200,
    path: '/api/v1/content/articles/edge-computing-guide',
    cacheOutcome: 'STALE',
    latencyMs: 16,
    originLatencyMs: 188,
    costSaved: 0.00014,
    clientIp: '198.51.100.12',
    pop: 'NRT',
    headers: {
      'x-cacheflow-status': 'STALE-REVALIDATING',
      'cf-edge-pop': 'NRT-01',
      'cache-control': 'public, max-age=300, stale-while-revalidate=86400',
      'x-revalidation-dispatched': 'true'
    },
    responsePayload: {
      title: 'Architecting 100k RPS with Sub-10ms Global Edge Caches',
      published_at: '2026-10-15',
      reading_time: '6 min',
      revalidation_epoch: 1730934862
    },
    ttlRemainingSec: 0
  },
  {
    id: 'req_01HP9Z7M2X1W8',
    timestamp: '23:14:20.900',
    timeMs: Date.now() - 15300,
    method: 'DELETE',
    statusCode: 200,
    path: '/api/v1/cache/purge?tag=catalog:88291',
    cacheOutcome: 'BYPASS',
    latencyMs: 44,
    originLatencyMs: 44,
    costSaved: 0,
    clientIp: '192.0.2.77',
    pop: 'IAD',
    headers: {
      'x-cacheflow-action': 'PURGE_DIRECT',
      'x-purged-keys': '14',
      'cf-edge-pop': 'IAD-01'
    },
    responsePayload: {
      success: true,
      purged_tag: 'catalog:88291',
      invalidated_edge_pops: 48,
      propagation_time_ms: 112
    },
    ttlRemainingSec: 0
  }
];

export const INITIAL_CACHE_RULES: CacheRule[] = [
  {
    id: 'rule_catalog_01',
    name: 'Product Catalog & Category Tree',
    pattern: '/api/v1/catalog/**',
    edgeTtlSec: 86400,
    staleWhileRevalidateSec: 604800,
    browserMaxAgeSec: 3600,
    queryParamMode: 'whitelist',
    whitelistedParams: ['sku', 'currency', 'lang'],
    cacheOnAuth: false,
    enabled: true,
    hitCount: 8420910,
    createdAt: '2026-09-12'
  },
  {
    id: 'rule_pricing_02',
    name: 'Realtime Currency & FX Rates',
    pattern: '/api/v1/pricing/realtime/**',
    edgeTtlSec: 60,
    staleWhileRevalidateSec: 300,
    browserMaxAgeSec: 30,
    queryParamMode: 'include_all',
    cacheOnAuth: false,
    enabled: true,
    hitCount: 2914800,
    createdAt: '2026-10-04'
  },
  {
    id: 'rule_graphql_03',
    name: 'Public GraphQL Queries (Search & Taxonomy)',
    pattern: '/graphql?op=Search*',
    edgeTtlSec: 600,
    staleWhileRevalidateSec: 3600,
    browserMaxAgeSec: 120,
    queryParamMode: 'include_all',
    cacheOnAuth: false,
    enabled: true,
    hitCount: 1482010,
    createdAt: '2026-10-18'
  },
  {
    id: 'rule_static_04',
    name: 'Static Media & Compressed Blobs',
    pattern: '/static/cdn/**',
    edgeTtlSec: 2592000,
    staleWhileRevalidateSec: 2592000,
    browserMaxAgeSec: 86400,
    queryParamMode: 'strip_all',
    cacheOnAuth: true,
    enabled: true,
    hitCount: 19804000,
    createdAt: '2026-08-01'
  }
];

export const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: 'key_prod_edge_primary',
    name: 'Edge Gateway Production Proxy',
    environment: 'production',
    keyPrefix: 'cf_live_',
    maskedSecret: '••••••••••••••••••••••••••••94b2',
    fullSecret: 'cf_live_9f7a81b2c4e6d8a0f2b4c6e8a1d394b2',
    permissions: ['read', 'write', 'purge'],
    createdAt: '2026-10-01',
    lastUsedAt: 'Just now',
    rotationStatus: 'active'
  },
  {
    id: 'key_cicd_purge_bot',
    name: 'CI/CD Pipeline Invalidation Worker',
    environment: 'production',
    keyPrefix: 'cf_live_',
    maskedSecret: '••••••••••••••••••••••••••••e109',
    fullSecret: 'cf_live_33aa77ff01bb44ee88cc22dd5511e109',
    permissions: ['purge'],
    createdAt: '2026-10-14',
    lastUsedAt: '12m ago',
    rotationStatus: 'active'
  },
  {
    id: 'key_finops_exporter',
    name: 'Datadog / FinOps Telemetry Sync',
    environment: 'production',
    keyPrefix: 'cf_live_',
    maskedSecret: '••••••••••••••••••••••••••••77a3',
    fullSecret: 'cf_live_bb9911ee2288337744665555aa8877a3',
    permissions: ['read', 'metrics'],
    createdAt: '2026-10-22',
    lastUsedAt: '1h ago',
    rotationStatus: 'active'
  },
  {
    id: 'key_staging_gateway',
    name: 'Staging Environment Proxy',
    environment: 'staging',
    keyPrefix: 'cf_test_',
    maskedSecret: '••••••••••••••••••••••••••••33f1',
    fullSecret: 'cf_test_aa11223344556677889900aabbcc33f1',
    permissions: ['read', 'write', 'purge', 'metrics'],
    createdAt: '2026-11-02',
    lastUsedAt: '4s ago',
    rotationStatus: 'active'
  }
];

export const LATENCY_HISTORY_24H = [
  { time: '00:00', edgeLatency: 12.1, originLatency: 198, hitRate: 88.1, rps: 1820 },
  { time: '02:00', edgeLatency: 11.4, originLatency: 185, hitRate: 89.4, rps: 1410 },
  { time: '04:00', edgeLatency: 10.9, originLatency: 182, hitRate: 90.2, rps: 1180 },
  { time: '06:00', edgeLatency: 11.8, originLatency: 194, hitRate: 87.9, rps: 1740 },
  { time: '08:00', edgeLatency: 13.2, originLatency: 215, hitRate: 86.8, rps: 2490 },
  { time: '10:00', edgeLatency: 14.5, originLatency: 228, hitRate: 88.5, rps: 3120 },
  { time: '12:00', edgeLatency: 15.1, originLatency: 242, hitRate: 89.1, rps: 3450 },
  { time: '14:00', edgeLatency: 14.8, originLatency: 236, hitRate: 88.8, rps: 3310 },
  { time: '16:00', edgeLatency: 13.9, originLatency: 218, hitRate: 89.5, rps: 2980 },
  { time: '18:00', edgeLatency: 13.4, originLatency: 204, hitRate: 88.2, rps: 2640 },
  { time: '20:00', edgeLatency: 12.8, originLatency: 196, hitRate: 87.9, rps: 2380 },
  { time: '22:00', edgeLatency: 12.2, originLatency: 191, hitRate: 88.7, rps: 2190 },
];
