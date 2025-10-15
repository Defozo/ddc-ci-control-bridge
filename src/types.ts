/**
 * Type definitions for DDC/CI MCP Server
 */

export interface VcpFeature {
  current: number;
  max: number;
}

export interface SupportedVcpCode {
  code: string;
  name: string;
  current: number;
  max: number;
}

export interface MonitorCapabilities {
  supported: SupportedVcpCode[];
  unsupported: number[];
  timestamp: Date;
}

export interface ServerConfig {
  apiKey: string;
  mcpTransport: 'sse' | 'stdio';
  mcpPort: number;
  mqttEnabled: boolean;
  mqttHost: string;
  mqttPort: number;
  mqttUsername: string;
  mqttPassword: string;
  autoScan: boolean;
  scanInterval: number;
  logLevel: string;
}

export interface HomeAssistantDevice {
  identifiers: string[];
  name: string;
  manufacturer: string;
  model: string;
  sw_version: string;
  configuration_url?: string;
  suggested_area?: string;
}

export interface HomeAssistantDiscoveryConfig {
  name: string;
  unique_id: string;
  device: HomeAssistantDevice;
  [key: string]: any;
}


