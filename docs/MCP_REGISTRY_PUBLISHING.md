# MCP Registry Publishing Guide

This document explains how the DDC/CI Control Bridge is configured for automated publishing to the Model Context Protocol (MCP) Registry.

## Overview

The project uses **automated GitHub Actions publishing** with GitHub OIDC authentication (no secrets needed for MCP registry!).

## What's Been Set Up

### 1. `server.json` ✅
Located in the project root, this file contains:
- **Server metadata**: Name, title, description
- **Package information**: NPM package identifier and version
- **Repository details**: GitHub source information
- **Validated** against the official MCP schema

### 2. `package.json` Updates ✅
Added `mcpName` field for NPM package validation:
```json
"mcpName": "io.github.defoz/ddc-ci-control-bridge"
```

This field is required by the MCP registry to verify package ownership.

### 3. GitHub Actions Workflow ✅
Created `.github/workflows/publish-mcp.yml` that:
- Triggers on version tags (e.g., `v1.0.0`)
- Builds and publishes to NPM
- Automatically updates versions in both `package.json` and `server.json`
- Publishes to MCP Registry using GitHub OIDC (no secrets!)

## How to Publish

### Prerequisites

1. **Push your code to GitHub**:
   ```bash
   git remote add origin https://github.com/Defozo/ddc-ci-control-bridge.git
   git push -u origin main
   ```

2. **Set up NPM_TOKEN secret**:
   - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Click "Generate New Token" → "Automation"
   - Copy the token
   - In your GitHub repo: Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm token

### Publishing a New Version

When you're ready to publish:

```bash
# Create a version tag
git tag v1.0.0

# Push the tag to GitHub
git push origin v1.0.0
```

**That's it!** The GitHub Actions workflow will automatically:
1. ✅ Checkout code
2. ✅ Build TypeScript
3. ✅ Update versions in package.json and server.json
4. ✅ Publish to NPM
5. ✅ Login to MCP Registry (via GitHub OIDC)
6. ✅ Publish to MCP Registry

### Monitoring the Workflow

1. Go to your GitHub repo
2. Click "Actions" tab
3. Watch the "Publish to MCP Registry" workflow run
4. Check for any errors

### Verifying Publication

After successful publishing, verify your server appears in the registry:

```bash
curl "https://registry.modelcontextprotocol.io/v0/servers?search=io.github.Defozo/ddc-ci-control-bridge"
```

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- **v1.0.0** - Major release
- **v1.1.0** - New features (backward compatible)
- **v1.0.1** - Bug fixes

## Authentication

The workflow uses **GitHub OIDC** authentication:
- ✅ No secrets needed for MCP Registry
- ✅ Automatic authentication via GitHub Actions
- ✅ Permissions: `id-token: write` (already configured)

## Namespace

Your server uses the `io.github.Defozo/*` namespace:
- Automatically authenticated via GitHub
- Tied to your GitHub account
- No DNS setup required

## Troubleshooting

### "Package validation failed"
- Ensure NPM publish succeeded first
- Verify `mcpName` field in package.json matches `name` in server.json

### "NPM publish failed"
- Check that NPM_TOKEN secret is set correctly
- Verify you haven't already published this version

### "MCP Registry authentication failed"
- Ensure `id-token: write` permission is in workflow (already set)
- Check that you pushed to the correct GitHub repository

## Files Reference

- **`server.json`** - MCP Registry metadata (root of project)
- **`package.json`** - Added `mcpName` field
- **`.github/workflows/publish-mcp.yml`** - Automated publishing workflow

## Manual Publishing (Fallback)

If you need to publish manually:

1. Install MCP Publisher:
   ```bash
   npm install -g @modelcontextprotocol/mcp-publisher
   ```

2. Login to MCP Registry:
   ```bash
   mcp-publisher login github
   ```

3. Publish:
   ```bash
   mcp-publisher publish
   ```

## Next Steps

1. Push your code to GitHub
2. Set up NPM_TOKEN secret
3. Create your first release tag
4. Watch the magic happen! ✨

For more information:
- [MCP Publishing Guide](https://github.com/modelcontextprotocol/registry/blob/main/docs/guides/publishing/publish-server.md)
- [GitHub Actions Guide](https://github.com/modelcontextprotocol/registry/blob/main/docs/guides/publishing/github-actions.md)

