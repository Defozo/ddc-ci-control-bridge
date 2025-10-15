/**
 * DDC/CI Monitor Controller
 * Manages DDC/CI communication with monitors
 */

import { VCP_CODES, getVcpCodeName } from './vcp-codes';
import { MonitorCapabilities, VcpFeature } from './types';

// Import types from @ddc-node/ddc-node
import type { Display } from '@ddc-node/ddc-node';

export class MonitorController {
  private displays: Display[] = [];
  private capabilities = new Map<number, MonitorCapabilities>();
  
  async initialize(): Promise<void> {
    console.log('🔍 Scanning for DDC/CI monitors...');
    
    try {
      // Import @ddc-node/ddc-node dynamically
      const { DisplayManager } = await import('@ddc-node/ddc-node');
      const manager = new DisplayManager();
      const allDisplays = await manager.collect();
      
      if (allDisplays.length === 0) {
        console.warn('⚠️  No DDC/CI monitors found!');
        console.warn('   Make sure DDC/CI is enabled in your monitor\'s OSD settings.');
        return;
      }
      
      console.log(`✓ Found ${allDisplays.length} display(s)\n`);
      
      // Log and filter displays
      const validDisplays: Display[] = [];
      const skippedDisplays: Display[] = [];
      
      for (let i = 0; i < allDisplays.length; i++) {
        const display = allDisplays[i];
        console.log(`📺 Display ${i}:`);
        console.log(`   Index:           ${display.index}`);
        console.log(`   Backend:         ${display.backend}`);
        console.log(`   Display ID:      ${display.displayId}`);
        console.log(`   Manufacturer ID: ${display.manufacturerId || 'N/A'}`);
        console.log(`   Model Name:      ${display.modelName || 'N/A'}`);
        console.log(`   Model ID:        ${display.modelId || 'N/A'}`);
        console.log(`   Serial Number:   ${display.serialNumber || display.serial || 'N/A'}`);
        console.log(`   Manufacture:     ${display.manufactureYear || 'N/A'} Week ${display.manufactureWeek || 'N/A'}`);
        console.log(`   MCCS Version:    ${display.mccsVersion || 'N/A'}`);
        console.log(`   Version:         ${display.version || 'N/A'}`);
        
        // Filter out generic/virtual displays without proper metadata
        const isGenericPnP = display.displayId?.includes('Generic PnP Monitor');
        const hasMetadata = display.manufacturerId || display.modelName || display.serialNumber;
        
        if (isGenericPnP && !hasMetadata) {
          console.log(`   ⚠️  SKIPPED: Generic display without DDC/CI metadata\n`);
          skippedDisplays.push(display);
        } else {
          console.log(`   ✓ Valid monitor\n`);
          validDisplays.push(display);
        }
      }
      
      this.displays = validDisplays;
      
      if (this.displays.length === 0) {
        console.warn('⚠️  No valid DDC/CI monitors found after filtering!');
        return;
      }
      
      console.log(`📊 Summary: ${this.displays.length} valid monitor(s), ${skippedDisplays.length} skipped\n`);
      
      // Scan all VCP codes on startup
      for (let i = 0; i < this.displays.length; i++) {
        await this.scanMonitor(i);
      }
      
      console.log('✓ Monitor scanning complete\n');
    } catch (error) {
      console.error('❌ Error initializing DDC/CI:', error);
      throw error;
    }
  }
  
  async scanMonitor(index: number): Promise<void> {
    const display = this.displays[index];
    if (!display) {
      throw new Error(`Monitor ${index} not found`);
    }
    
    const supported: Array<{ code: string; name: string; current: number; max: number }> = [];
    const unsupported: number[] = [];
    
    console.log(`  Scanning monitor ${index}... (this may take 30-60 seconds)`);
    
    for (let code = 0x00; code <= 0xFF; code++) {
      try {
        const result = await display.getVcpFeature(code);
        // Handle different response types from @ddc-node
        let current = 0;
        let max = 0;
        
        if ('currentValue' in result && 'maximumValue' in result) {
          // Continuous type
          current = result.currentValue as number;
          max = result.maximumValue as number;
        } else if ('currentValue' in result && 'possibleValues' in result) {
          // NonContinuous type
          current = result.currentValue as number;
          const values = Object.keys(result.possibleValues).map(k => parseInt(k, 10));
          max = values.length > 0 ? Math.max(...values, current) : current;
        }
        
        supported.push({
          code: `0x${code.toString(16).toUpperCase().padStart(2, '0')}`,
          name: getVcpCodeName(code),
          current,
          max,
        });
      } catch (e) {
        unsupported.push(code);
      }
    }
    
    this.capabilities.set(index, {
      supported,
      unsupported,
      timestamp: new Date(),
    });
    
    console.log(`  ✓ Monitor ${index}: ${supported.length}/256 codes supported`);
  }
  
  async getVcpCode(index: number, code: number): Promise<VcpFeature> {
    const display = this.displays[index];
    if (!display) {
      throw new Error(`Monitor ${index} not found`);
    }
    
    const result = await display.getVcpFeature(code);
    
    // Convert @ddc-node response to standard VcpFeature
    if ('currentValue' in result && 'maximumValue' in result) {
      return { current: result.currentValue as number, max: result.maximumValue as number };
    } else if ('currentValue' in result && 'possibleValues' in result) {
      const values = Object.keys(result.possibleValues).map(k => parseInt(k, 10));
      const maxValue = values.length > 0 ? Math.max(...values, result.currentValue as number) : result.currentValue as number;
      return { current: result.currentValue as number, max: maxValue };
    }
    
    return { current: 0, max: 0 };
  }
  
  async setVcpCode(index: number, code: number, value: number): Promise<void> {
    const display = this.displays[index];
    if (!display) {
      throw new Error(`Monitor ${index} not found`);
    }
    
    await display.setVcpFeature(code, value);
  }
  
  getCapabilities(index: number): MonitorCapabilities | undefined {
    return this.capabilities.get(index);
  }
  
  supportsVcp(index: number, code: number): boolean {
    const caps = this.capabilities.get(index);
    if (!caps) return false;
    
    return caps.supported.some((c) => parseInt(c.code, 16) === code);
  }
  
  getMonitorCount(): number {
    return this.displays.length;
  }
}

