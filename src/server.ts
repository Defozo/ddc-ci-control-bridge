/**
 * DDC/CI MCP Server
 * FastMCP server with DDC/CI monitor control and Home Assistant integration
 */

import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { MonitorController } from './controller';
import { MqttBridge } from './mqtt-bridge';
import { loadConfig, printSetupInstructions } from './config';
import { getVcpCodeName } from './vcp-codes';

export async function startServer(): Promise<void> {
  // Load configuration
  const config = loadConfig();
  
  // Initialize monitor controller
  const controller = new MonitorController();
  
  try {
    if (config.autoScan) {
      await controller.initialize();
    }
  } catch (error) {
    console.error('Failed to initialize monitors:', error);
    console.error('Continuing without monitor support...');
  }
  
  // Create FastMCP server
  const mcp = new FastMCP({
    name: 'DDC/CI Control Bridge',
    version: '1.0.0',
  });
  
  // Add authentication
  // Note: FastMCP TypeScript API key auth might be different - using basic approach
  // TODO: Implement proper FastMCP auth when API is clarified
  
  // Register MCP Resources
  mcp.addResource({
    uri: 'monitor://list',
    name: 'Monitor List',
    description: 'List of all connected DDC/CI monitors',
    mimeType: 'application/json',
    async load() {
      const count = controller.getMonitorCount();
      const monitors = [];
      
      for (let i = 0; i < count; i++) {
        const caps = controller.getCapabilities(i);
        monitors.push({
          index: i,
          supportedCodes: caps?.supported.length || 0,
          timestamp: caps?.timestamp,
        });
      }
      
      return {
        text: JSON.stringify({ monitors, count }, null, 2),
      };
    },
  });
  
  // Dynamic resource template for monitor capabilities
  mcp.addResourceTemplate({
    uriTemplate: 'monitor://{index}/capabilities',
    name: 'Monitor Capabilities',
    description: 'Full VCP code scan results for a monitor',
    mimeType: 'application/json',
    arguments: [
      {
        name: 'index',
        description: 'Monitor index',
        required: true,
      },
    ],
    async load(args) {
      const index = parseInt(args.index as string, 10);
      const caps = controller.getCapabilities(index);
      
      if (!caps) {
        return { text: JSON.stringify({ error: 'Monitor not found' }) };
      }
      
      return {
        text: JSON.stringify(caps, null, 2),
      };
    },
  });
  
  // Register MCP Tools
  mcp.addTool({
    name: 'get_vcp_code',
    description: 'Read a specific VCP code value from a monitor',
    parameters: z.object({
      monitor_index: z.number().describe('Monitor index (0-based)'),
      code: z.number().describe('VCP code (0x00-0xFF)'),
    }),
    async execute(args: any) {
      try {
        const result = await controller.getVcpCode(args.monitor_index, args.code);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                code: `0x${args.code.toString(16).toUpperCase().padStart(2, '0')}`,
                name: getVcpCodeName(args.code),
                current: result.current,
                max: result.max,
              }, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  });
  
  mcp.addTool({
    name: 'set_vcp_code',
    description: 'Write a value to a specific VCP code',
    parameters: z.object({
      monitor_index: z.number().describe('Monitor index (0-based)'),
      code: z.number().describe('VCP code (0x00-0xFF)'),
      value: z.number().describe('Value to set'),
    }),
    async execute(args: any) {
      try {
        await controller.setVcpCode(args.monitor_index, args.code, args.value);
        return {
          content: [
            {
              type: 'text',
              text: `Successfully set VCP code 0x${args.code.toString(16).toUpperCase().padStart(2, '0')} to ${args.value}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  });
  
  mcp.addTool({
    name: 'get_brightness',
    description: 'Get monitor brightness (0-100)',
    parameters: z.object({
      monitor_index: z.number().describe('Monitor index (0-based)'),
    }),
    async execute(args: any) {
      try {
        const result = await controller.getVcpCode(args.monitor_index, 0x10);
        return {
          content: [
            {
              type: 'text',
              text: `Brightness: ${result.current}%`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    },
  });
  
  mcp.addTool({
    name: 'set_brightness',
    description: 'Set monitor brightness (0-100)',
    parameters: z.object({
      monitor_index: z.number().describe('Monitor index (0-based)'),
      value: z.number().min(0).max(100).describe('Brightness value (0-100)'),
    }),
    async execute(args: any) {
      try {
        await controller.setVcpCode(args.monitor_index, 0x10, args.value);
        return {
          content: [
            {
              type: 'text',
              text: `Brightness set to ${args.value}%`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    },
  });
  
  mcp.addTool({
    name: 'refresh_monitors',
    description: 'Re-scan monitors and VCP capabilities',
    parameters: z.object({}),
    async execute() {
      try {
        await controller.initialize();
        return {
          content: [
            {
              type: 'text',
              text: `Re-scanned ${controller.getMonitorCount()} monitor(s)`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    },
  });
  
  // Initialize MQTT bridge for Home Assistant
  const mqttBridge = new MqttBridge(controller, config);
  await mqttBridge.connect();
  
  // Print setup instructions
  printSetupInstructions(config);
  
  // Start MCP server
  const transport = config.mcpTransport;
  if (transport === 'sse') {
    console.log(`🚀 Starting MCP Server on http://localhost:${config.mcpPort}`);
    await mcp.start({ 
      transportType: 'httpStream',
      httpStream: {
        port: config.mcpPort
      }
    });
  } else {
    console.log('🚀 Starting MCP Server on stdio');
    await mcp.start({ transportType: 'stdio' });
  }
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\nShutting down...');
    await mqttBridge.disconnect();
    process.exit(0);
  });
}

// Run if executed directly
if (require.main === module) {
  startServer().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

