#!/usr/bin/env node
/**
 * CLI Entry Point for DDC/CI MCP Server
 */

const { startServer } = require('../dist/server');

startServer().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


