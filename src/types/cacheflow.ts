export type HTTPMethod = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';

export type CacheOutcome = 'HIT' | 'MISS' | 'STALE' | 'BYPASS';

export interface RequestLog {
  id: string;
  timestamp: string;
  timeMs: number;
  method: HTTPMethod;
  statusCode: number;
  path: string;
  cacheOutcome: CacheOutcome;
  latencyMs: number;
  originLatencyMs: number;
  costSaved: number;
  clientIp: string;
  pop: string;
  headers: Record<string, string>;
  responsePayload: Record<string, any>;
  ttlRemainingSec: number;
}

export interface MetricCardData {
  title: string;
  value: string;
  subValue: string;
  trend: string;
  trendType: 'positive' | 'negative' | 'neutral';
  pillText: string;
  pillVariant: 'emerald' | 'blue' | 'amber';
}

export interface CacheRule {
  id: string;
  name: string;
  pattern: string;
  edgeTtlSec: number;
  staleWhileRevalidateSec: number;
  browserMaxAgeSec: number;
  queryParamMode: 'strip_all' | 'include_all' | 'whitelist';
  whitelistedParams?: string[];
  cacheOnAuth: boolean;
  enabled: boolean;
  hitCount: number;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  environment: 'production' | 'staging' | 'development';
  keyPrefix: string;
  maskedSecret: string;
  fullSecret: string;
  permissions: ('read' | 'write' | 'purge' | 'metrics')[];
  createdAt: string;
  lastUsedAt: string;
  rotationStatus: 'active' | 'rotating' | 'deprecated';
  secondaryKey?: string;
  gracePeriodEndsAt?: string;
}

export interface RegionPOP {
  code: string;
  name: string;
  country: string;
  latencyMs: number;
  hitRate: number;
  rps: number;
  status: 'optimal' | 'degraded';
}

export type ActiveScreen = 
  | 'overview' 
  | 'stream' 
  | 'playground' 
  | 'rules' 
  | 'vault' 
  | 'finops';
