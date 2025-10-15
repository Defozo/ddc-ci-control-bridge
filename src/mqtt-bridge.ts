/**
 * MQTT Bridge for Home Assistant Integration
 * Handles MQTT Discovery Protocol and monitor control via MQTT
 */

import mqtt, { MqttClient } from 'mqtt';
import { MonitorController } from './controller';
import { ServerConfig, HomeAssistantDiscoveryConfig } from './types';

export class MqttBridge {
  private client: MqttClient | null = null;
  private controller: MonitorController;
  private config: ServerConfig;
  private stateInterval: NodeJS.Timeout | null = null;
  
  constructor(controller: MonitorController, config: ServerConfig) {
    this.controller = controller;
    this.config = config;
  }
  
  async connect(): Promise<void> {
    if (!this.config.mqttEnabled) {
      console.log('ℹ️  MQTT disabled - Home Assistant integration not available');
      return;
    }
    
    console.log(`📡 Connecting to MQTT broker at ${this.config.mqttHost}:${this.config.mqttPort}...`);
    
    this.client = mqtt.connect(`mqtt://${this.config.mqttHost}:${this.config.mqttPort}`, {
      username: this.config.mqttUsername,
      password: this.config.mqttPassword,
      will: {
        topic: 'ddc-monitor/bridge/status',
        payload: 'offline',
        qos: 1,
        retain: true,
      },
    });
    
    this.client.on('connect', async () => {
      console.log('✓ Connected to MQTT broker');
      
      // Subscribe to command topics
      this.client!.subscribe('ddc-monitor/+/brightness/set');
      this.client!.subscribe('ddc-monitor/+/contrast/set');
      this.client!.subscribe('ddc-monitor/+/vcp/+/set');
      this.client!.subscribe('ddc-monitor/+/power/set');
      
      // Publish online status
      await this.publishAsync('ddc-monitor/bridge/status', 'online', { retain: true });
      
      // Publish Home Assistant discovery
      await this.publishDiscovery();
      
      // Publish initial states
      for (let i = 0; i < this.controller.getMonitorCount(); i++) {
        await this.publishState(i);
      }
      
      // Start periodic state updates (every 30 seconds)
      this.startStatePolling();
      
      console.log('✓ Home Assistant discovery published');
      console.log('✓ Entities should appear in Home Assistant now');
    });
    
    this.client.on('message', async (topic, payload) => {
      await this.handleCommand(topic, payload.toString());
    });
    
    this.client.on('error', (error) => {
      console.error('❌ MQTT error:', error.message);
      if (error.message.includes('Not authorized')) {
        console.error('   Check your MQTT credentials!');
      }
    });
    
    this.client.on('close', () => {
      console.log('⚠️  MQTT connection closed');
    });
  }
  
  private async publishDiscovery(): Promise<void> {
    const monitorCount = this.controller.getMonitorCount();
    
    for (let i = 0; i < monitorCount; i++) {
      const device = {
        identifiers: [`ddc_monitor_${i}`],
        name: `DDC Monitor ${i}`,
        manufacturer: 'DDC/CI MCP Server',
        model: 'Monitor Control',
        sw_version: '1.0.0',
        configuration_url: `http://localhost:${this.config.mcpPort}`,
        suggested_area: 'Office',
      };
      
      // Light entity for brightness + power control
      await this.publishEntityConfig('light', `ddc_monitor_${i}`, {
        name: `Monitor ${i} Backlight`,
        unique_id: `ddc_monitor_${i}_brightness`,
        brightness_scale: 100,
        brightness_command_topic: `ddc-monitor/${i}/brightness/set`,
        brightness_state_topic: `ddc-monitor/${i}/brightness/get`,
        state_topic: `ddc-monitor/${i}/state`,
        command_topic: `ddc-monitor/${i}/power/set`,
        payload_on: 'ON',
        payload_off: 'OFF',
        device,
      });
      
      // Number entity for contrast
      await this.publishEntityConfig('number', `ddc_monitor_${i}_contrast`, {
        name: `Monitor ${i} Contrast`,
        unique_id: `ddc_monitor_${i}_contrast`,
        command_topic: `ddc-monitor/${i}/contrast/set`,
        state_topic: `ddc-monitor/${i}/contrast/get`,
        min: 0,
        max: 100,
        step: 1,
        device,
      });
      
      // Switch for LED strip (if supported - VCP 0xE9)
      if (this.controller.supportsVcp(i, 0xE9)) {
        await this.publishEntityConfig('switch', `ddc_monitor_${i}_led`, {
          name: `Monitor ${i} LED Strip`,
          unique_id: `ddc_monitor_${i}_led`,
          command_topic: `ddc-monitor/${i}/vcp/E9/set`,
          state_topic: `ddc-monitor/${i}/vcp/E9/get`,
          payload_on: '1',
          payload_off: '0',
          device,
        });
      }
      
      // Select for input source (if supported - VCP 0x60)
      if (this.controller.supportsVcp(i, 0x60)) {
        await this.publishEntityConfig('select', `ddc_monitor_${i}_input`, {
          name: `Monitor ${i} Input Source`,
          unique_id: `ddc_monitor_${i}_input`,
          command_topic: `ddc-monitor/${i}/vcp/60/set`,
          state_topic: `ddc-monitor/${i}/vcp/60/get`,
          options: ['HDMI-1', 'HDMI-2', 'DisplayPort', 'USB-C'],
          device,
        });
      }
    }
  }
  
  private async publishEntityConfig(
    component: string,
    objectId: string,
    config: HomeAssistantDiscoveryConfig
  ): Promise<void> {
    const topic = `homeassistant/${component}/${objectId}/config`;
    await this.publishAsync(topic, JSON.stringify(config), { retain: true, qos: 1 });
  }
  
  private async handleCommand(topic: string, value: string): Promise<void> {
    const match = topic.match(/ddc-monitor\/(\d+)\/(brightness|contrast|power|vcp\/([0-9A-Fa-f]+))\/set/);
    if (!match) return;
    
    const [, monitorIdxStr, command, vcpCode] = match;
    const monitorIndex = parseInt(monitorIdxStr, 10);
    
    try {
      switch (command) {
        case 'brightness':
          await this.controller.setVcpCode(monitorIndex, 0x10, parseInt(value, 10));
          break;
        
        case 'contrast':
          await this.controller.setVcpCode(monitorIndex, 0x12, parseInt(value, 10));
          break;
        
        case 'power':
          // VCP 0xD6: 1=on, 4=standby
          const powerValue = value === 'ON' ? 1 : 4;
          await this.controller.setVcpCode(monitorIndex, 0xD6, powerValue);
          break;
        
        default:
          if (vcpCode) {
            await this.controller.setVcpCode(monitorIndex, parseInt(vcpCode, 16), parseInt(value, 10));
          }
      }
      
      // Immediately publish updated state
      await this.publishState(monitorIndex);
    } catch (error) {
      console.error(`Error handling command ${topic}:`, error);
    }
  }
  
  private async publishState(monitorIndex: number): Promise<void> {
    try {
      // Brightness
      const brightness = await this.controller.getVcpCode(monitorIndex, 0x10);
      await this.publishAsync(
        `ddc-monitor/${monitorIndex}/brightness/get`,
        brightness.current.toString()
      );
      
      // Contrast
      const contrast = await this.controller.getVcpCode(monitorIndex, 0x12);
      await this.publishAsync(
        `ddc-monitor/${monitorIndex}/contrast/get`,
        contrast.current.toString()
      );
      
      // Power state
      const power = await this.controller.getVcpCode(monitorIndex, 0xD6);
      const state = power.current === 1 ? 'ON' : 'OFF';
      await this.publishAsync(`ddc-monitor/${monitorIndex}/state`, state);
      
      // LED strip (if supported)
      if (this.controller.supportsVcp(monitorIndex, 0xE9)) {
        const led = await this.controller.getVcpCode(monitorIndex, 0xE9);
        await this.publishAsync(
          `ddc-monitor/${monitorIndex}/vcp/E9/get`,
          led.current.toString()
        );
      }
      
      // Input source (if supported)
      if (this.controller.supportsVcp(monitorIndex, 0x60)) {
        const input = await this.controller.getVcpCode(monitorIndex, 0x60);
        await this.publishAsync(
          `ddc-monitor/${monitorIndex}/vcp/60/get`,
          input.current.toString()
        );
      }
    } catch (error) {
      console.error(`Error publishing state for monitor ${monitorIndex}:`, error);
    }
  }
  
  private startStatePolling(): void {
    // Poll and publish state every 30 seconds
    this.stateInterval = setInterval(async () => {
      for (let i = 0; i < this.controller.getMonitorCount(); i++) {
        await this.publishState(i);
      }
    }, 30000);
  }
  
  private async publishAsync(topic: string, message: string, options?: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error('MQTT client not connected'));
        return;
      }
      
      this.client.publish(topic, message, options || {}, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
  
  async disconnect(): Promise<void> {
    if (this.stateInterval) {
      clearInterval(this.stateInterval);
    }
    
    if (this.client) {
      await this.publishAsync('ddc-monitor/bridge/status', 'offline', { retain: true });
      this.client.end();
    }
  }
}


