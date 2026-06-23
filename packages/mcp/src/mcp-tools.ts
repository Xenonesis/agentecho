import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { store } from "./store.js";

export function registerMcpTools(server: Server) {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "pinmark_list_sessions",
          description: "List all active annotation sessions.",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "pinmark_get_session",
          description: "Get a specific session with all its annotations.",
          inputSchema: {
            type: "object",
            properties: {
              sessionId: {
                type: "string",
                description: "The ID of the session to retrieve.",
              },
            },
            required: ["sessionId"],
          },
        },
        {
          name: "pinmark_get_pending",
          description: "Get pending (unacknowledged) annotations for a specific session.",
          inputSchema: {
            type: "object",
            properties: {
              sessionId: {
                type: "string",
                description: "The ID of the session to retrieve pending annotations for.",
              },
            },
            required: ["sessionId"],
          },
        },
        {
          name: "pinmark_get_all_pending",
          description: "Get pending annotations across ALL active sessions.",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "pinmark_acknowledge",
          description: "Mark an annotation as acknowledged, indicating you are looking into it.",
          inputSchema: {
            type: "object",
            properties: {
              annotationId: {
                type: "string",
                description: "The ID of the annotation to acknowledge.",
              },
            },
            required: ["annotationId"],
          },
        },
        {
          name: "pinmark_resolve",
          description: "Mark an annotation as resolved after fixing the issue.",
          inputSchema: {
            type: "object",
            properties: {
              annotationId: {
                type: "string",
                description: "The ID of the annotation to resolve.",
              },
              agentName: {
                type: "string",
                description: "Your name/identifier (e.g. 'Claude Code').",
              },
            },
            required: ["annotationId", "agentName"],
          },
        },
        {
          name: "pinmark_dismiss",
          description: "Dismiss an annotation if it cannot be fixed or is irrelevant.",
          inputSchema: {
            type: "object",
            properties: {
              annotationId: {
                type: "string",
                description: "The ID of the annotation to dismiss.",
              },
              reason: {
                type: "string",
                description: "The reason for dismissing the annotation.",
              },
            },
            required: ["annotationId", "reason"],
          },
        }
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
      case "pinmark_list_sessions": {
        const sessions = store.getAllSessions();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(sessions.map(s => ({
                id: s.id,
                url: s.url,
                annotationCount: s.annotations.length,
                updatedAt: new Date(s.updatedAt).toISOString()
              })), null, 2),
            },
          ],
        };
      }

      case "pinmark_get_session": {
        const sessionId = String(request.params.arguments?.sessionId);
        const session = store.getSession(sessionId);
        if (!session) {
          throw new McpError(ErrorCode.InvalidParams, `Session ${sessionId} not found`);
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(session, null, 2),
            },
          ],
        };
      }

      case "pinmark_get_pending": {
        const sessionId = String(request.params.arguments?.sessionId);
        const pending = store.getPendingAnnotations(sessionId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(pending, null, 2),
            },
          ],
        };
      }

      case "pinmark_get_all_pending": {
        const pending = store.getPendingAnnotations();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(pending, null, 2),
            },
          ],
        };
      }

      case "pinmark_acknowledge": {
        const annotationId = String(request.params.arguments?.annotationId);
        const annotation = await store.updateAnnotationStatus(annotationId, 'acknowledged');
        if (!annotation) {
          throw new McpError(ErrorCode.InvalidParams, `Annotation ${annotationId} not found`);
        }
        return {
          content: [
            {
              type: "text",
              text: `Annotation ${annotationId} marked as acknowledged.`,
            },
          ],
        };
      }

      case "pinmark_resolve": {
        const annotationId = String(request.params.arguments?.annotationId);
        const agentName = String(request.params.arguments?.agentName);
        const annotation = await store.updateAnnotationStatus(annotationId, 'resolved', agentName);
        if (!annotation) {
          throw new McpError(ErrorCode.InvalidParams, `Annotation ${annotationId} not found`);
        }
        return {
          content: [
            {
              type: "text",
              text: `Annotation ${annotationId} marked as resolved by ${agentName}.`,
            },
          ],
        };
      }

      case "pinmark_dismiss": {
        const annotationId = String(request.params.arguments?.annotationId);
        const reason = String(request.params.arguments?.reason);
        const annotation = await store.updateAnnotationStatus(annotationId, 'dismissed', undefined, reason);
        if (!annotation) {
          throw new McpError(ErrorCode.InvalidParams, `Annotation ${annotationId} not found`);
        }
        return {
          content: [
            {
              type: "text",
              text: `Annotation ${annotationId} dismissed. Reason: ${reason}`,
            },
          ],
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, "Unknown tool");
    }
  });
}
