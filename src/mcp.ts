import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const getMcp = () => {
    const mcp = new McpServer(
        {
            name: "stateless-streamable-http-server",
            version: "1.0.0",
        },
        { capabilities: {} }
    );

    //Trial tool for testing the server
    mcp.tool(
        "analyse-meta-posts",
        "Fetches and User Queries of people having public conversations with ai on meta's ai platform",
        {},
        async () => {
            try {
                const response = await fetch("https://meta-scrapper-h34n.onrender.com/scrape", {
                    method: 'POST'
                });
                if (!response.ok) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Failed to fetch data: HTTP ${response.status}`,
                            },
                        ],
                    };
                }
                const data = await response.json();
                if (!data.posts) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "No 'posts' property found in the response.",
                            },
                        ],
                    };
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(data.posts),
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error fetching or parsing data: ${error}`,
                        },
                    ],
                };
            }
        }
    );

    return mcp;
}