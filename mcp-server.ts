import fs from "fs";
import path from "path";
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

    // Claude Desktop has a hard 1MB limit on tool responses. High-res images exceed this.
    // Therefore, we save the high-res image locally.
    const outputsDir = path.join(process.cwd(), "outputs");
    if (!fs.existsSync(outputsDir)) {
      fs.mkdirSync(outputsDir, { recursive: true });
    }

    const filename = `design-${Date.now()}.png`;
    const filepath = path.join(outputsDir, filename);
    const buffer = Buffer.from(base64Data, "base64");
    fs.writeFileSync(filepath, buffer);

    // Compress the image using sharp to fit within the 1MB limit for the chat UI
    let compressedBase64 = base64Data;
    let compressedMime = mimeType;
    try {
      const sharp = (await import("sharp")).default;
      const compressedBuffer = await sharp(buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      
      compressedBase64 = compressedBuffer.toString("base64");
      compressedMime = "image/jpeg";
    } catch (e) {
      console.error("Failed to compress image:", e);
      // Fallback to text only if compression fails or result is still too large
      return {
        content: [
          {
            type: "text",
            text: `Image successfully generated!\n\nDue to chat size limits, the high-resolution original was saved locally to your machine at:\n**${filepath}**`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Image successfully generated! A compressed preview is shown below.\n\nThe high-resolution original was saved locally to your machine at:\n**${filepath}**`,
        },
        {
          type: "image",
          data: compressedBase64,
          mimeType: compressedMime,
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
