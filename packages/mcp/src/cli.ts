#!/usr/bin/env node
import { Command } from 'commander';
import { runServer } from './server.js';

const program = new Command();

program
  .name('pinmark-mcp')
  .description('MCP Server and HTTP bridge for Pinmark visual feedback')
  .version('1.0.0');

program
  .command('server')
  .description('Start the MCP stdio server and HTTP bridge')
  .option('-p, --port <number>', 'HTTP server port', '4747')
  .action(async (options) => {
    try {
      await runServer(parseInt(options.port, 10));
    } catch (e) {
      console.error('Fatal error:', e);
      process.exit(1);
    }
  });

program.parse();
