import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerMcpTools } from "./mcp-tools.js";
import { createHttpServer } from "./http-routes.js";

export async function runServer(port: number) {
  // Start HTTP server for extension
  const app = createHttpServer();
  app.listen(port, () => {
    console.error(`[Pinmark] HTTP Server running on http://localhost:${port}`);
  });

  // Start MCP server for agents over stdio
  const server = new Server(
    {
      name: "pinmark-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  registerMcpTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[Pinmark] MCP Server connected over stdio");
}
