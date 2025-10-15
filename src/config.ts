/**
 * Configuration management for DDC/CI MCP Server
 */

import { config as dotenvConfig } from 'dotenv';
import { ServerConfig } from './types';

// Load environment variables
dotenvConfig();

export function loadConfig(): ServerConfig {
  const apiKey = process.env.DDC_API_KEY || process.env.FASTMCP_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'DDC_API_KEY is required! Please set it in your .env file or environment variables.'
    );
  }

  return {
    apiKey,
    mcpTransport: (process.env.MCP_TRANSPORT as 'sse' | 'stdio') || 'sse',
    mcpPort: parseInt(process.env.MCP_PORT || '8000', 10),
    mqttEnabled: process.env.MQTT_ENABLED === 'true',
    mqttHost: process.env.MQTT_HOST || 'localhost',
    mqttPort: parseInt(process.env.MQTT_PORT || '1883', 10),
    // Use API key as MQTT password for simplicity
    mqttUsername: 'ddc-mcp',
    mqttPassword: apiKey,
    autoScan: process.env.AUTO_SCAN !== 'false',
    scanInterval: parseInt(process.env.SCAN_INTERVAL || '300', 10),
    logLevel: process.env.LOG_LEVEL || 'info',
  };
}

export function printSetupInstructions(config: ServerConfig): void {
  const serverIp = getLocalIP();
  
  console.log('\n' + '='.repeat(70));
  console.log('✓ DDC/CI Control Bridge Started!');
  console.log('='.repeat(70));
  
  if (config.mqttEnabled) {
    console.log('\n📋 MQTT CONNECTION STATUS:\n');
    console.log(`   Connecting to MQTT broker: ${config.mqttHost}:${config.mqttPort}`);
    console.log(`   Username: ${config.mqttUsername}`);
    console.log('   This server acts as MQTT CLIENT (not broker)\n');
    
    console.log('💡 HOME ASSISTANT SETUP:\n');
    console.log('1. Install MQTT broker in Home Assistant:');
    console.log('   Settings → Add-ons → Mosquitto → Install & Start\n');
    console.log('2. Configure this DDC server to connect to Home Assistant:');
    console.log('   Edit .env file and set:');
    console.log('   MQTT_HOST=<your-home-assistant-ip>');
    console.log('   MQTT_PORT=1883');
    console.log(`   Current: MQTT_HOST=${config.mqttHost}\n`);
    console.log('3. Monitor entities will auto-discover in Home Assistant\n');
  } else {
    console.log('\nℹ️  MQTT is disabled. Set MQTT_ENABLED=true in .env to enable Home Assistant integration.\n');
  }
  
  console.log('='.repeat(70));
  console.log(`\n🔌 MCP Server: http://${serverIp}:${config.mcpPort}`);
  console.log(`   Transport: ${config.mcpTransport}`);
  console.log(`   API Key: ${config.apiKey.substring(0, 8)}...`);
  console.log('\n' + '='.repeat(70) + '\n');
}

function getLocalIP(): string {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}


