# Security Policy

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by:

1. **Email**: Create an issue on GitHub with the `security` label
2. **Response Time**: We aim to respond within 48 hours
3. **Fix Timeline**: Security fixes are prioritized and typically released within 7 days

## Known Issues

### pkg Local Privilege Escalation (GHSA-22r3-9w55-cj54)

**Status**: Accepted Risk  
**Severity**: Moderate  
**Component**: `pkg` (devDependency)

**Details**:
- The `pkg` package has a local privilege escalation vulnerability
- This package is only used during build time to create standalone executables
- The vulnerability requires local access to the build environment
- It does not affect the runtime security of the application

**Mitigation**:
- Build processes should be run in trusted, isolated environments
- Users downloading pre-built executables are not affected
- The vulnerability is explicitly allowlisted in `audit-ci.json`
- Security audits are configured to fail on HIGH and CRITICAL vulnerabilities only

**Alternative Considered**:
We evaluated alternative executable builders (nexe, caxa, boxednode) but chose to maintain `pkg` because:
1. It provides the best compatibility across platforms
2. The risk is limited to build-time in CI/CD environments
3. GitHub Actions provides isolated build environments
4. End users are not exposed to this vulnerability

## Security Audit Configuration

Our security audit is configured to:
- ✅ Fail on HIGH and CRITICAL vulnerabilities
- ✅ Monitor MODERATE vulnerabilities (but don't fail builds)
- ✅ Run weekly automated security scans
- ✅ Use Dependabot for automatic dependency updates

See `audit-ci.json` and `.github/workflows/security.yml` for configuration details.

## Best Practices for Users

1. **Download from Official Sources**: Only download executables from GitHub Releases
2. **Verify Checksums**: Check release artifacts against published checksums (when available)
3. **Use Latest Version**: Always use the latest version for security patches
4. **Report Issues**: Report any security concerns immediately

## Security Contacts

- **GitHub Issues**: Use the `security` label
- **Response Time**: Within 48 hours
- **Fix Timeline**: Within 7 days for critical issues

