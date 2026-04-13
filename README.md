<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1A6SA6EcQ3h0VPJDfPlqtFeP75FpL8Iy7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## MCP Support

This repository includes a Model Context Protocol (MCP) server that lets Claude Desktop generate images directly within your chats.

### Setup Claude Desktop

1. Clone this repository to your local machine and install dependencies:
   ```bash
   git clone https://github.com/pradyumn-shopos/-free.git officeviz-ai
   cd officeviz-ai
   npm install
   ```
2. Add this configuration to your Claude Desktop config file:
   - **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "officeviz-ai": {
      "command": "npx",
      "args": [
        "tsx",
        "/absolute/path/to/this/repository/mcp-server.ts"
      ],
      "env": {
        "GEMINI_API_KEY": "your-gemini-api-key-here"
      }
    }
  }
}
```

3. Restart Claude Desktop.
4. Try asking Claude: *"Generate a 16:9 image of a futuristic office using the officeviz-ai tool."*
