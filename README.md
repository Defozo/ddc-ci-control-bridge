# DDC/CI Control Bridge

![DDC/CI Control Bridge](docs/banner.png)

[![NPM Version](https://img.shields.io/npm/v/ddc-ci-control-bridge?color=red)](https://www.npmjs.com/package/ddc-ci-control-bridge) [![MIT licensed](https://img.shields.io/github/license/Defozo/ddc-ci-control-bridge)](./LICENSE) [![GitHub Release](https://img.shields.io/github/v/release/Defozo/ddc-ci-control-bridge)](https://github.com/Defozo/ddc-ci-control-bridge/releases)

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=ddc-ci-bridge&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImRkYy1jaS1jb250cm9sLWJyaWRnZSJdfQ%3D%3D) [<img alt="Install in VS Code" src="https://img.shields.io/badge/Install%20in%20VS%20Code-0098FF?style=for-the-badge&logo=visualstudiocode&logoColor=white">](https://insiders.vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%7B%22name%22%3A%22ddc-ci-bridge%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22ddc-ci-control-bridge%22%5D%7D)

Multi-protocol server for DDC/CI monitor control with MCP and MQTT support.

## Features

- **DDC/CI Monitor Control**: Read and write VCP codes to control monitor brightness, contrast, input source, and more
- **Model Context Protocol (MCP)**: Server with resources and tools for AI/agent integration
- **MQTT Client**: Connect to any MQTT broker for IoT/automation platforms
  - Home Assistant auto-discovery support
  - Generic MQTT pub/sub for custom integrations
- **Cross-Platform**: Works on Windows, Linux, and macOS
- **Dual Distribution**: Available as standalone executable or npm package

## Quick Start

### Installation

**Option 1: NPM Package (Global)**
```bash
npm install -g ddc-ci-control-bridge
ddc-ci-bridge
```

**Option 2: NPX (No Install)**
```bash
npx ddc-ci-control-bridge
```

**Option 3: Standalone Executable**

Download the binary for your platform from [GitHub Releases](https://github.com/Defozo/ddc-ci-control-bridge/releases):

- **Windows**: `ddc-ci-bridge-windows.exe`
- **Linux**: `ddc-ci-bridge-linux`
- **macOS**: `ddc-ci-bridge-macos`

Then run it:

**Windows:**
```cmd
# Run directly
.\ddc-ci-bridge-windows.exe

# Or with environment variables
set DDC_API_KEY=your-secret-key
set MQTT_ENABLED=true
set MQTT_HOST=192.168.1.100
.\ddc-ci-bridge-windows.exe
```

**Linux/macOS:**
```bash
# Make executable
chmod +x ddc-ci-bridge-linux  # or ddc-ci-bridge-macos

# Run directly
./ddc-ci-bridge-linux

# Or with environment variables
DDC_API_KEY=your-secret-key MQTT_ENABLED=true MQTT_HOST=192.168.1.100 ./ddc-ci-bridge-linux
```

**Using with MCP Clients:**

Configure your MCP client to use the executable path:

```json
{
  "mcpServers": {
    "ddc-ci-bridge": {
      "command": "/path/to/ddc-ci-bridge-linux",
      "args": [],
      "env": {
        "MQTT_ENABLED": "false"
      }
    }
  }
}
```

### MCP Client Setup

Choose between **Local (stdio)** or **Remote (HTTP)** setup depending on your needs:

- **Local Setup**: Run MCP server on the same machine as your monitors (recommended for most users)
- **Remote Setup**: Run MCP server on a monitor-connected machine, access from other devices

---

#### 🖥️ Local Setup (stdio - Same Machine)

Use this if your MCP client is on the same machine as your monitors.

<details>
<summary><b>Install in Cursor (Local)</b></summary>

Go to: `Settings` → `Cursor Settings` → `MCP` → `Add new global MCP server`

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=ddc-ci-bridge&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImRkYy1jaS1jb250cm9sLWJyaWRnZSJdfQ%3D%3D)

Or paste the following configuration into your `~/.cursor/mcp.json` file:

```json
{
  "mcpServers": {
    "ddc-ci-bridge": {
      "command": "npx",
      "args": ["-y", "ddc-ci-control-bridge"],
      "env": {
        "MQTT_ENABLED": "false",
        "MQTT_HOST": "localhost",
        "MQTT_PORT": "1883"
      }
    }
  }
}
```

**Optional MQTT**: Set `MQTT_ENABLED=true` and configure `MQTT_HOST` to your MQTT broker IP for automation platform integration.

</details>

<details>
<summary><b>Install in VS Code (Local)</b></summary>

[<img alt="Install in VS Code" src="https://img.shields.io/badge/VS_Code-Install%20DDC/CI%20Bridge-0098FF?style=flat-square">](https://insiders.vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%7B%22name%22%3A%22ddc-ci-bridge%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22ddc-ci-control-bridge%22%5D%7D)

Add this to your VS Code MCP config file:

```json
"mcp": {
  "servers": {
    "ddc-ci-bridge": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "ddc-ci-control-bridge"],
      "env": {
        "MQTT_ENABLED": "false"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Install in Claude Desktop (Local)</b></summary>

Open Claude Desktop developer settings and edit your `claude_desktop_config.json` file:

```json
{
  "mcpServers": {
    "ddc-ci-bridge": {
      "command": "npx",
      "args": ["-y", "ddc-ci-control-bridge"],
      "env": {
        "MQTT_ENABLED": "false"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Install in Claude Code (Local)</b></summary>

Run this command:

```sh
claude mcp add ddc-ci-bridge -- npx -y ddc-ci-control-bridge
```

</details>

<details>
<summary><b>Install in Windsurf (Local)</b></summary>

Add this to your Windsurf MCP config file:

```json
{
  "mcpServers": {
    "ddc-ci-bridge": {
      "command": "npx",
      "args": ["-y", "ddc-ci-control-bridge"],
      "env": {
        "MQTT_ENABLED": "false"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Install in Cline (Local)</b></summary>

Add this to your Cline MCP configuration:

```json
{
  "mcpServers": {
    "ddc-ci-bridge": {
      "command": "npx",
      "args": ["-y", "ddc-ci-control-bridge"],
      "env": {
        "MQTT_ENABLED": "false"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Install in Zed (Local)</b></summary>

Add this to your Zed `settings.json`:

```json
{
  "context_servers": {
    "DDC/CI Bridge": {
      "source": "custom",
      "command": "npx",
      "args": ["-y", "ddc-ci-control-bridge"],
      "env": {
        "MQTT_ENABLED": "false"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Install in Roo Code (Local)</b></summary>

Add this to your Roo Code MCP configuration:

```json
{
  "mcpServers": {
    "ddc-ci-bridge": {
      "command": "npx",
      "args": ["-y", "ddc-ci-control-bridge"],
      "env": {
        "MQTT_ENABLED": "false"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Install in Augment Code (Local)</b></summary>

**Option A: Using the UI**

1. Click the hamburger menu
2. Select **Settings**
3. Navigate to **Tools** section
4. Click **+ Add MCP** button
5. Enter command: `npx -y ddc-ci-control-bridge`
6. Name: **DDC/CI Bridge**
7. Click **Add**

**Option B: Manual Configuration**

Add to `settings.json`:

```json
"augment.advanced": {
  "mcpServers": [
    {
      "name": "ddc-ci-bridge",
      "command": "npx",
      "args": ["-y", "ddc-ci-control-bridge"],
      "env": {
        "MQTT_ENABLED": "false"
      }
    }
  ]
}
```

</details>

<details>
<summary><b>Install in JetBrains AI Assistant (Local)</b></summary>

1. Go to `Settings` → `Tools` → `AI Assistant` → `Model Context Protocol (MCP)`
2. Click `+ Add`
3. Select **As JSON** from the dropdown
4. Add this configuration:

```json
{
  "mcpServers": {
    "ddc-ci-bridge": {
      "command": "npx",
      "args": ["-y", "ddc-ci-control-bridge"],
      "env": {
        "MQTT_ENABLED": "false"
      }
    }
  }
}
```

5. Click `Apply` to save changes

</details>

<details>
<summary><b>Install in Warp (Local)</b></summary>

1. Navigate `Settings` → `AI` → `Manage MCP servers`
2. Click `+ Add` button
3. Paste this configuration:

```json
{
  "DDC/CI Bridge": {
    "command": "npx",
    "args": ["-y", "ddc-ci-control-bridge"],
    "env": {
      "FASTMCP_API_KEY": "your-api-key-here",
      "MQTT_ENABLED": "false"
    },
    "working_directory": null,
    "start_on_launch": true
  }
}
```

4. Click `Save`

</details>

<details>
<summary><b>Install in OpenAI Codex (Local)</b></summary>

Add to your Codex MCP configuration:

```toml
[mcp_servers.ddc-ci-bridge]
command = "npx"
args = ["-y", "ddc-ci-control-bridge"]

[mcp_servers.ddc-ci-bridge.env]
MQTT_ENABLED = "false"
```

**Windows Users**: Use full paths if you encounter timeout errors:

```toml
[mcp_servers.ddc-ci-bridge]
command = "cmd"
args = ["/c", "npx", "-y", "ddc-ci-control-bridge"]
startup_timeout_ms = 20_000

[mcp_servers.ddc-ci-bridge.env]
SystemRoot = "C:\\Windows"
FASTMCP_API_KEY = "your-api-key-here"
MQTT_ENABLED = "false"
```

</details>

<details>
<summary><b>Install in LM Studio (Local)</b></summary>

1. Navigate to `Program` (right side) → `Install` → `Edit mcp.json`
2. Add this configuration:

```json
{
  "mcpServers": {
    "DDC/CI Bridge": {
      "command": "npx",
      "args": ["-y", "ddc-ci-control-bridge"],
      "env": {
        "MQTT_ENABLED": "false"
      }
    }
  }
}
```

3. Click `Save`
4. Toggle the MCP server on/off from the right side panel

</details>

<details>
<summary><b>Install in Qodo Gen (Local)</b></summary>

1. Open Qodo Gen chat panel in VSCode or IntelliJ
2. Click **Connect more tools**
3. Click **+ Add new MCP**
4. Add this configuration:

```json
{
  "mcpServers": {
    "ddc-ci-bridge": {
      "command": "npx",
      "args": ["-y", "ddc-ci-control-bridge"],
      "env": {
        "MQTT_ENABLED": "false"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Install in Perplexity Desktop (Local)</b></summary>

1. Navigate `Perplexity` → `Settings`
2. Select `Connectors`
3. Click `Add Connector`
4. Select `Advanced`
5. Enter Server Name: **DDC/CI Bridge**
6. Paste this JSON:

```json
{
  "command": "npx",
  "args": ["-y", "ddc-ci-control-bridge"],
  "env": {
    "FASTMCP_API_KEY": "your-api-key-here",
    "MQTT_ENABLED": "false"
  }
}
```

7. Click `Save`

</details>

<details>
<summary><b>Install in Kiro (Local)</b></summary>

1. Navigate `Kiro` → `MCP Servers`
2. Click `+ Add` button
3. Paste this configuration:

```json
{
  "mcpServers": {
    "DDC/CI Bridge": {
      "command": "npx",
      "args": ["-y", "ddc-ci-control-bridge"],
      "env": {
        "MQTT_ENABLED": "false"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

4. Click `Save`

</details>

<details>
<summary><b>Install in BoltAI (Local)</b></summary>

1. Open **Settings** → **Plugins**
2. Enter this JSON:

```json
{
  "mcpServers": {
    "ddc-ci-bridge": {
      "command": "npx",
      "args": ["-y", "ddc-ci-control-bridge"],
      "env": {
        "MQTT_ENABLED": "false"
      }
    }
  }
}
```

3. Save and restart if needed

</details>

<details>
<summary><b>Install in Zencoder (Local)</b></summary>

1. Go to Zencoder menu (...)
2. Select **Agent tools**
3. Click **Add custom MCP**
4. Add name and server configuration:

```json
{
  "command": "npx",
  "args": ["-y", "ddc-ci-control-bridge"],
  "env": {
    "FASTMCP_API_KEY": "your-api-key-here",
    "MQTT_ENABLED": "false"
  }
}
```

5. Click **Install**

</details>

<details>
<summary><b>Install in Amazon Q Developer CLI (Local)</b></summary>

Add to your Amazon Q configuration:

```json
{
  "mcpServers": {
    "ddc-ci-bridge": {
      "command": "npx",
      "args": ["-y", "ddc-ci-control-bridge"],
      "env": {
        "MQTT_ENABLED": "false"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Using Bun or Deno</b></summary>

**Bun:**

```json
{
  "mcpServers": {
    "ddc-ci-bridge": {
      "command": "bunx",
      "args": ["-y", "ddc-ci-control-bridge"],
      "env": {
        "MQTT_ENABLED": "false"
      }
    }
  }
}
```

**Deno:**

```json
{
  "mcpServers": {
    "ddc-ci-bridge": {
      "command": "deno",
      "args": [
        "run",
        "--allow-env",
        "--allow-net",
        "npm:ddc-ci-control-bridge"
      ],
      "env": {
        "MQTT_ENABLED": "false"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Windows-Specific Configuration</b></summary>

On Windows, use this format (example with Cline):

```json
{
  "mcpServers": {
    "ddc-ci-bridge": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "ddc-ci-control-bridge"],
      "env": {
        "MQTT_ENABLED": "false"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

</details>

---

#### 🌐 Remote Setup (HTTP - Different Machines)

Use this if you want to access monitor controls from a different machine on your network.

<details>
<summary><b>Step 1: Set up the MCP Server on Monitor-Connected Machine</b></summary>

1. On the machine with monitors, create a `.env` file:

```bash
DDC_API_KEY=your-secure-random-api-key-here
MCP_TRANSPORT=sse
MCP_PORT=8000

# Optional: Enable MQTT for automation platforms
MQTT_ENABLED=false
MQTT_HOST=localhost
MQTT_PORT=1883
```

2. Start the server:

```bash
npm install -g ddc-ci-control-bridge
ddc-ci-bridge
```

Or using npx:

```bash
npx ddc-ci-control-bridge
```

3. The server will display:
```
🔌 MCP Server: http://192.168.1.100:8000
   Transport: sse
   API Key: your-api...
```

Note the IP address and port for client configuration.

</details>

<details>
<summary><b>Step 2: Configure MCP Clients (Remote Connection)</b></summary>

**Cursor:**
```json
{
  "mcpServers": {
    "ddc-ci-bridge": {
      "url": "http://192.168.1.100:8000",
      "headers": {
        "Authorization": "Bearer your-secure-random-api-key-here"
      }
    }
  }
}
```

**VS Code:**
```json
"mcp": {
  "servers": {
    "ddc-ci-bridge": {
      "type": "http",
      "url": "http://192.168.1.100:8000",
      "headers": {
        "Authorization": "Bearer your-secure-random-api-key-here"
      }
    }
  }
}
```

**Claude Desktop:**
```json
{
  "mcpServers": {
    "ddc-ci-bridge": {
      "url": "http://192.168.1.100:8000",
      "headers": {
        "Authorization": "Bearer your-secure-random-api-key-here"
      }
    }
  }
}
```

**Windsurf:**
```json
{
  "mcpServers": {
    "ddc-ci-bridge": {
      "serverUrl": "http://192.168.1.100:8000",
      "headers": {
        "Authorization": "Bearer your-secure-random-api-key-here"
      }
    }
  }
}
```

**Note:** Replace `192.168.1.100` with the actual IP address of your monitor-connected machine, and use the same API key you configured in the server's `.env` file.

</details>

---

### Configuration

1. Create a `.env` file:
```bash
cp .env.example .env
```

2. Edit `.env` and configure:
```bash
DDC_API_KEY=your-secret-api-key-here

# Enable MQTT for automation platforms (optional)
MQTT_ENABLED=false
MQTT_HOST=localhost
MQTT_PORT=1883
```

**To enable MQTT**: Set `MQTT_ENABLED=true` and change `MQTT_HOST` to your MQTT broker IP (e.g., Home Assistant IP).

3. Start the server:
```bash
npm run dev
```

## MQTT Integration

This server acts as an MQTT client and can connect to any MQTT broker.

### Supported Platforms

- **Home Assistant**: Auto-discovery via MQTT Discovery Protocol → See [Home Assistant Guide](./docs/README-HOMEASSISTANT.md)
- **openHAB**: MQTT binding with manual thing configuration
- **Node-RED**: Subscribe to topics for custom flows
- **Domoticz**: MQTT integration
- **Generic MQTT**: Any platform that supports MQTT pub/sub

### MQTT Topics

```
ddc-monitor/{index}/brightness/set|get
ddc-monitor/{index}/contrast/set|get
ddc-monitor/{index}/vcp/{code}/set|get
ddc-monitor/{index}/power/set
ddc-monitor/{index}/state
ddc-monitor/bridge/status
```

## MCP Resources

- `monitor://list` - List all available monitors
- `monitor://{index}/capabilities` - Full VCP code scan results
- `monitor://{index}/current-values` - Current values of all supported codes
- `monitor://{index}/info` - Monitor metadata

## MCP Tools

- `get_vcp_code` - Read a specific VCP code value
- `set_vcp_code` - Write a value to a VCP code
- `get_brightness` - Get monitor brightness (0-100)
- `set_brightness` - Set monitor brightness (0-100)
- `refresh_monitors` - Re-scan monitors and VCP capabilities

## Development

### Build

```bash
npm run build
```

### Build Executables

```bash
npm run build:executables
```

This creates standalone executables in `dist/bin/` for Windows, Linux, and macOS.

### Run in Development

```bash
npm run dev
```

## Requirements

- **DDC/CI Support**: Your monitor must support DDC/CI (most modern monitors do)
- **DDC/CI Enabled**: Enable DDC/CI in your monitor's OSD settings
- **Permissions**: On Linux, you may need to add your user to the `i2c` group

### Linux Setup

```bash
sudo usermod -a -G i2c $USER
sudo modprobe i2c-dev
```

Log out and log back in for group changes to take effect.

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `DDC_API_KEY` - API key for server authentication (required)
- `MCP_TRANSPORT` - Transport type: `sse` or `stdio` (default: `sse`)
- `MCP_PORT` - HTTP port for SSE transport (default: `8000`)
- `MQTT_ENABLED` - Enable MQTT client (default: `false`)
- `MQTT_HOST` - MQTT broker IP/hostname (default: `localhost`)
- `MQTT_PORT` - MQTT broker port (default: `1883`)
- `MQTT_USERNAME` - Auto-configured as `ddc-mcp`
- `MQTT_PASSWORD` - Auto-configured from `DDC_API_KEY`

## Architecture

```
┌─────────────────────────────────────────┐
│       DDC/CI Control Bridge             │
│                                         │
│  ┌─────────────────┐  ┌──────────────┐ │
│  │  MCP Server     │  │ MQTT Client  │ │
│  │  - Resources    │  │ - Pub/Sub    │ │
│  │  - Tools        │  │ - Discovery  │ │
│  └────────┬────────┘  └──────┬───────┘ │
│           │                  │         │
│           └────────┬─────────┘         │
│                    │                   │
│           ┌────────▼────────┐          │
│           │ DDC Controller  │          │
│           │ - VCP Scanning  │          │
│           │ - Read/Write    │          │
│           └────────┬────────┘          │
└────────────────────┼───────────────────┘
                     │
            ┌────────▼────────┐
            │ Physical Monitor│
            │   (DDC/CI)      │
            └─────────────────┘

External Clients:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ AI Agents    │  │ MQTT Broker  │  │ Automation   │
│ (via MCP)    │  │ (any broker) │  │ Platforms    │
└──────────────┘  └──────────────┘  └──────────────┘
```

## License

MIT

## Documentation

- [Home Assistant Integration Guide](./docs/README-HOMEASSISTANT.md) - Complete HA setup
- [Development Guide](./docs/DEVELOPMENT.md) - Technical architecture and development details

## Contributing

Contributions welcome! Please open an issue or PR.

## Troubleshooting

### No monitors found

- Ensure DDC/CI is enabled in your monitor's OSD settings
- On Linux, check if i2c devices are available: `ls -l /dev/i2c-*`
- Try running with elevated permissions (not recommended for production)

### MQTT connection failed

- Verify MQTT broker is running
- Check credentials match the server output
- Ensure firewall allows MQTT port (1883)

### Commands not working

- Check server logs for errors
- Verify monitor supports the VCP code
- Some codes may be read-only
- Try restarting both server and Home Assistant
