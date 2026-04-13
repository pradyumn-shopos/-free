import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { GoogleGenAI } from "@google/genai";

const getApiKey = (): string => {
  const envApiKey = process.env.GEMINI_API_KEY || process.env.VITE_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!envApiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return envApiKey;
};

const server = new Server(
  {
    name: "officeviz-ai-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate_design",
        description: "Generate a professional, high-definition photorealistic image/design using Gemini.",
        inputSchema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "The request/prompt for the image generation.",
            },
            aspectRatio: {
              type: "string",
              enum: ["1:1", "16:9", "9:16", "4:3", "3:4", "2:3"],
              description: "The aspect ratio of the image. Default is 16:9.",
            },
            resolution: {
              type: "string",
              enum: ["1K", "2K", "4K"],
              description: "The resolution of the image. Default is 2K.",
            },
          },
          required: ["prompt"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "generate_design") {
    throw new McpError(
      ErrorCode.MethodNotFound,
      `Unknown tool: ${request.params.name}`
    );
  }

  const { prompt, aspectRatio = "16:9", resolution = "2K" } = request.params.arguments as any;

  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const model = "gemini-2.5-flash-image";

    const enhancedPrompt = `
    Generate a photorealistic, high-quality image based on the user's request.

    User Request: ${prompt}

    The image should be professional and high definition.
    `;

    const requestConfig: any = {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: resolution,
      },
    };

    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: enhancedPrompt }] }],
      config: requestConfig,
    });

    if (response.promptFeedback?.blockReason) {
       throw new Error(`Prompt blocked (${response.promptFeedback.blockReason}). Try rephrasing your request.`);
    }

    const candidate = response.candidates?.[0];
    const finishReason = candidate?.finishReason as string | undefined;

    if (finishReason === 'IMAGE_SAFETY') {
      throw new Error('Image blocked by safety filter. Try a different prompt or subject.');
    }

    let base64Data: string | null = null;
    let mimeType: string = "image/png";

    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          base64Data = part.inlineData.data;
          mimeType = part.inlineData.mimeType || "image/png";
          break;
        }
      }
    }

    if (!base64Data) {
        throw new Error(`No image returned in response (finishReason: ${finishReason ?? "unknown"}).`);
    }

    return {
      content: [
        {
          type: "image",
          data: base64Data,
          mimeType: mimeType,
        },
      ],
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Failed to generate image: ${error.message || error}`,
        },
      ],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("OfficeViz AI MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
