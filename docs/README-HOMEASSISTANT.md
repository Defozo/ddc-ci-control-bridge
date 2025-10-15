# Home Assistant Integration Guide

Complete guide to integrating DDC/CI Control Bridge with Home Assistant.

## Overview

The DDC/CI Control Bridge automatically integrates with Home Assistant via **MQTT Discovery Protocol**. 

**Architecture:**
- **Home Assistant** runs the **Mosquitto MQTT Broker** (server)
- **DDC/CI Control Bridge** acts as an **MQTT Client** and connects to Home Assistant's broker
- Monitor entities auto-discover via MQTT - no manual configuration needed!

## Prerequisites

- Home Assistant running (on same or different machine)
- Mosquitto MQTT broker add-on installed in Home Assistant
- DDC/CI Control Bridge running on the machine connected to your monitor(s)

## Setup Steps

### 1. Install MQTT Broker in Home Assistant

1. Open Home Assistant
2. Navigate to **Settings → Add-ons**
3. Click **Add-on Store**
4. Search for "Mosquitto broker"
5. Click **Install**
6. Once installed, click **Start**
7. Enable **Start on boot** (recommended)

### 2. Configure MQTT Integration

1. Navigate to **Settings → Devices & Services → Integrations**
2. If MQTT integration is not already configured, click **+ Add Integration**
3. Search for "MQTT" and select it
4. Click **Submit** to use default settings (localhost)
5. Ensure **Enable discovery** is checked (should be by default)

### 3. Configure DDC/CI Control Bridge to Connect to Home Assistant

On the machine with the monitor(s):

```bash
# Create .env file
cp .env.example .env

# Edit .env
nano .env  # or use your preferred editor
```

Configure these settings in `.env`:

```bash
DDC_API_KEY=your-secure-api-key-here

# Enable MQTT and set Home Assistant IP
MQTT_ENABLED=true
MQTT_HOST=192.168.1.100  # Replace with your Home Assistant IP
MQTT_PORT=1883
```

**Important:** `MQTT_HOST` should be your **Home Assistant's IP address**, not the DDC bridge's IP!

### 4. Start DDC/CI Control Bridge

```bash
# Start the server
npm run dev
# or
ddc-ci-bridge
```

The server will connect to Home Assistant's MQTT broker and publish discovery messages automatically.

### 5. Verify Entities Appeared

Within a few seconds, monitor control entities should appear:

1. Navigate to **Settings → Devices & Services → Integrations**
2. Find "MQTT" integration
3. You should see devices like "DDC Monitor 0"
4. Click on the device to see all entities:
   - Light: Monitor Backlight (brightness + power)
   - Number: Monitor Contrast (0-100 slider)
   - Switch: LED Strip (if supported)
   - Select: Input Source (if supported)

## Available Entities

Each monitor gets the following entities:

### Light Entity
- **Entity ID**: `light.ddc_monitor_0_backlight`
- **Controls**: Brightness (0-100%) and Power (on/off)
- **VCP Codes**: 0x10 (brightness), 0xD6 (power)

### Number Entity (Contrast)
- **Entity ID**: `number.ddc_monitor_0_contrast`
- **Controls**: Contrast (0-100)
- **VCP Code**: 0x12

### Switch Entity (LED Strip)
- **Entity ID**: `switch.ddc_monitor_0_led`
- **Controls**: LED strip on/off
- **VCP Code**: 0xE9 (manufacturer-specific)
- **Note**: Only created if monitor supports this feature

### Select Entity (Input Source)
- **Entity ID**: `select.ddc_monitor_0_input`
- **Controls**: Input source selection
- **VCP Code**: 0x60
- **Note**: Only created if monitor supports this feature

## Dashboard Example

Add to your Lovelace dashboard:

```yaml
type: entities
title: Monitor Controls
entities:
  - entity: light.ddc_monitor_0_backlight
    name: Brightness
  - entity: number.ddc_monitor_0_contrast
    name: Contrast
  - entity: switch.ddc_monitor_0_led
    name: LED Strip
  - entity: select.ddc_monitor_0_input
    name: Input Source
```

Or use a simple entities card:

```yaml
type: entities
entities:
  - light.ddc_monitor_0_backlight
  - number.ddc_monitor_0_contrast
  - switch.ddc_monitor_0_led
  - select.ddc_monitor_0_input
```

## Automation Examples

### Dim Monitors at Sunset

```yaml
automation:
  - alias: "Dim Monitors at Sunset"
    trigger:
      - platform: sun
        event: sunset
    action:
      - service: light.turn_on
        target:
          entity_id: light.ddc_monitor_0_backlight
        data:
          brightness_pct: 30
```

### Reduce Brightness at Night

```yaml
automation:
  - alias: "Reduce Monitor Brightness at Night"
    trigger:
      - platform: time
        at: "22:00:00"
    action:
      - service: light.turn_on
        target:
          entity_id: light.ddc_monitor_0_backlight
        data:
          brightness_pct: 20
```

### Turn Off Monitors When Away

```yaml
automation:
  - alias: "Turn Off Monitors When Away"
    trigger:
      - platform: state
        entity_id: person.your_name
        to: "not_home"
    action:
      - service: light.turn_off
        target:
          entity_id: light.ddc_monitor_0_backlight
```

### Auto Brightness Based on Room Light

```yaml
automation:
  - alias: "Auto Monitor Brightness"
    trigger:
      - platform: state
        entity_id: sensor.living_room_illuminance
    action:
      - service: light.turn_on
        target:
          entity_id: light.ddc_monitor_0_backlight
        data:
          brightness_pct: >
            {% set lux = states('sensor.living_room_illuminance') | int %}
            {% if lux < 50 %}30
            {% elif lux < 100 %}50
            {% elif lux < 300 %}70
            {% else %}100{% endif %}
```

## Troubleshooting

### Entities Not Appearing

**Check MQTT broker status:**
1. Settings → Add-ons → Mosquitto broker
2. Ensure it's running

**Check MQTT configuration:**
1. Settings → Integrations → MQTT → Configure
2. Verify broker address and credentials
3. Ensure discovery is enabled

**Check server logs:**
- Look for "✓ Home Assistant discovery published" message
- Check for MQTT connection errors

**Verify MQTT topics:**
1. Install "MQTT Explorer" (optional tool)
2. Connect to broker
3. Look for `homeassistant/` topics

### Commands Not Working

**Check monitor DDC/CI support:**
- Ensure DDC/CI is enabled in monitor OSD
- Some VCP codes may be read-only

**Check server logs:**
- Look for VCP errors
- Verify monitor index is correct

**Test MCP tools directly:**
- Use MCP client to test commands
- Verify commands work outside of HA

### Entities Showing "Unavailable"

**Server offline:**
- Restart DDC/CI Control Bridge
- Check server is running

**MQTT disconnected:**
- Check network connectivity
- Verify MQTT broker is running
- Check credentials haven't changed

### Delay in State Updates

- State updates occur every 30 seconds by default
- Commands are executed immediately
- State feedback appears after next poll cycle

### Multiple Monitors

If you have multiple monitors:
- Each monitor gets its own set of entities
- Entity IDs increment: `monitor_0`, `monitor_1`, etc.
- Scan order determined by system enumeration

## Advanced Configuration

### Custom MQTT Topics

The default MQTT topic structure is:
```
ddc-monitor/{index}/brightness/set|get
ddc-monitor/{index}/contrast/set|get
ddc-monitor/{index}/vcp/{code}/set|get
ddc-monitor/{index}/power/set
ddc-monitor/{index}/state
ddc-monitor/bridge/status
```

### Custom Scan Interval

Change state polling interval in `.env`:
```bash
SCAN_INTERVAL=60  # Seconds between state updates
```

### Disable Auto-Scan

If you want faster startup (skip VCP scanning):
```bash
AUTO_SCAN=false
```

Note: MCP resources won't be populated until first refresh.

## Security Considerations

1. **API Key**: Keep your API key secret
2. **Network**: Use firewall rules to restrict MQTT access
3. **MQTT Users**: Consider creating dedicated MQTT user in Home Assistant
4. **TLS**: For production, enable MQTT TLS/SSL

## Next Steps

- Add monitor controls to your dashboard
- Create automations for auto-brightness
- Set up scenes with monitor settings
- Integrate with presence detection

## Support

If you encounter issues:
1. Check server logs
2. Check Home Assistant logs (Settings → System → Logs)
3. Review MQTT integration logs
4. Open an issue on GitHub with logs attached


