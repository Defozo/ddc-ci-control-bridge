# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the DDC/CI Control Bridge project.

## Workflows

### 🔨 Build and Test (`build.yml`)
- **Triggers**: Push to `main`/`develop`, Pull Requests to `main`
- **Purpose**: Build TypeScript and create executables for all platforms
- **Artifacts**: Uploads executables for Ubuntu, Windows, and macOS
- **Retention**: 30 days

### 🚀 Release (`release.yml`)
- **Triggers**: Git tags starting with `v` (e.g., `v1.0.0`)
- **Purpose**: Create GitHub releases with executables and publish to npm
- **Steps**:
  1. Build executables for all platforms
  2. Publish to npm (if NPM_TOKEN is configured)
  3. Create GitHub release with all artifacts
- **Artifacts**: Retained for 90 days

### 📦 Publish to MCP Registry (`publish-mcp.yml`)
- **Triggers**: Git tags starting with `v` (e.g., `v1.0.0`)
- **Purpose**: Publish to the Model Context Protocol Registry
- **Steps**:
  1. Build and test
  2. Publish to npm
  3. Publish to MCP Registry using GitHub OIDC
- **Authentication**: GitHub OIDC (no secrets needed!)

### 🔍 Continuous Integration (`ci.yml`)
- **Triggers**: Push to `main`/`develop`, Pull Requests to `main`
- **Purpose**: Lint, type-check, and test the build
- **Steps**:
  - TypeScript compilation check
  - Build verification
  - Basic functionality test

### 🔒 Security Audit (`security.yml`)
- **Triggers**: Weekly schedule, push to `main`, Pull Requests
- **Purpose**: Check for security vulnerabilities in dependencies
- **Steps**:
  - npm audit
  - Known vulnerability checks

## Dependabot

Automatically updates dependencies:
- **npm packages**: Weekly on Mondays
- **GitHub Actions**: Weekly on Mondays
- **Auto-assigns**: Issues to maintainer

## Setup Requirements

### For Releases and MCP Publishing

1. **NPM Token** (for publishing to npm):
   - Go to npmjs.com → Account Settings → Access Tokens
   - Create a new token with "Automation" type
   - Add to GitHub repository secrets as `NPM_TOKEN`

2. **GitHub Token**:
   - Automatically provided by GitHub Actions
   - No setup required for MCP Registry (uses OIDC)

## Usage

### Creating a Release

1. Update version in `package.json`
2. Commit changes
3. Create and push a tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
4. GitHub Actions will automatically:
   - Build executables for all platforms
   - Publish to npm (if configured)
   - Publish to MCP Registry
   - Create a GitHub release with artifacts

### Manual Build

Push to `main` branch to trigger build workflow and get artifacts.

## Artifacts

### Executables
- **Windows**: `ddc-ci-bridge.exe`
- **Linux**: `ddc-ci-bridge` (binary)
- **macOS**: `ddc-ci-bridge` (binary)

### NPM Package
- Published as `ddc-ci-control-bridge`
- Available via `npm install -g ddc-ci-control-bridge`

### MCP Registry
- Server name: `io.github.Defozo/ddc-ci-control-bridge`
- Discoverable by all MCP clients

## Troubleshooting

### Build Failures
- Check TypeScript compilation errors
- Verify all dependencies are properly declared
- Ensure `pkg` can build for all target platforms

### Release Failures
- Verify NPM_TOKEN is set in repository secrets
- Check that version in package.json matches git tag
- Ensure you have publish permissions on npm

### MCP Publishing Failures
- Verify `mcpName` field in package.json matches server.json
- Ensure npm publish succeeded first
- Check GitHub Actions has `id-token: write` permission

### Security Audit Failures
- Review vulnerability details in workflow logs
- Update dependencies or add to allowlist in `audit-ci.json`
- Consider using `npm audit fix` for automatic fixes

## Customization

### Adding New Platforms
Edit `build.yml` and `release.yml` matrix strategies:
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest, ubuntu-20.04]
```

### Changing Build Targets
Update `package.json` build:executables script:
```json
"build:executables": "npm run build && pkg . --targets node18-win-x64,node18-linux-x64,node18-macos-x64,node18-alpine-x64 --output dist/bin/ddc-ci-bridge"
```

### Modifying Security Thresholds
Edit `audit-ci.json`:
```json
{
  "low": false,
  "moderate": true,
  "high": true,
  "critical": true
}
```

## More Information

- **Main README**: [../README.md](../README.md)
- **MCP Publishing Guide**: [../docs/MCP_REGISTRY_PUBLISHING.md](../docs/MCP_REGISTRY_PUBLISHING.md)
- **Development Guide**: [../docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md)

