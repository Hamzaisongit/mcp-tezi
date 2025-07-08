import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types.js";

export const getMcp = () => {
  const mcp = new Server(
    {
      name: "stateless-streamable-http-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {}
      }
    })

  mcp.setRequestHandler(ListResourcesRequestSchema, async (): Promise<any> => {
    return {
      resources: [
        {
          uri: "postgres://company-ids",
          name: "Company Names and corresponding reference Ids",
          description: "A mapping of company-names against their corresponding reference ids used in database as primarykeys",
          mimeType: "application/json"
        },
        {
          uri: "postgres://customer-ids",
          name: "Customer Names and corresponding reference Ids",
          description: "A mapping of customer-names against their corresponding reference ids used in database as primarykeys",
          mimeType: "application/json"
        }
      ]
    }
  })

  mcp.setRequestHandler(ReadResourceRequestSchema, async (request): Promise<any> => {

    if (request.params.uri.includes('company-ids')) {

      try {
        const response = await fetch('http://localhost:3000/company-ids')
        const result = await response.json()

        return {
          contents: [
            {
              uri: "postgres://company-ids",
              mimeType: "application/json",
              text: JSON.stringify(result)
            }
          ]
        }
      } catch (e) {
        console.log('error while handling company-ids resource read', e)
        throw new Error("while handling company-ids resource read")
      }

    } else if (request.params.uri.includes('customer-ids')) { //could be handles better when complexity increases 

      try {
        const response = await fetch('http://localhost:3000/customer-ids')
        const result = await response.json()

        return {
          contents: [
            {
              uri: "postgres://customer-ids",
              mimeType: "application/json",
              text: JSON.stringify(result)
            }
          ]
        }
      } catch (e) {
        console.log('error while handling customer-ids resource read', e)
        throw new Error("while handling customer-ids resource read")
      }

    }
  })

  mcp.setRequestHandler(ListToolsRequestSchema, async (): Promise<any> => {
    return {
      tools: [
        {
          name: "query-invoices",
          description: "Query Invoices based on the company, the customer and other plausible constraints",
          inputSchema: {
            type: "object",
            properties: {
              companyId: { type: "string", pattern: "^[0-9]+$" },
              customerId: { type: "string", pattern: "^[0-9]+$" },
              date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" }
            },
            // required: ["companyId", "customerId"]
          },
        },
        {
          name: "query-ledgers",
          description: "Query Ledgers based on the company, the customer, and a date range",
          inputSchema: {
            type: "object",
            properties: {
              companyId: { type: "string", pattern: "^[0-9]+$" },
              customerId: { type: "string", pattern: "^[0-9]+$" },
              fromDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
              toDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" }
            },
            required: ["companyId", "customerId"]
          }
        },
      ],
    };
  })

  mcp.setRequestHandler(CallToolRequestSchema, async (request): Promise<any> => {
    if (request.params.name == 'query-invoices') {

      try {
        const { companyId, customerId, date } = request.params.arguments as { companyId?: string; customerId?: string; date?: string };

        if (!companyId && !customerId) return { content: [{ type: 'text', text: "Insuficieant arguments" }] }

        const response = await fetch(`http://localhost:3000/get-invoice?companyId=${companyId || ""}&customerId=${customerId || ""}&date=${date || ""}`)
        const result = await response.json()

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result)
            }
          ]
        }
      } catch (e) {
        console.log("while calling tool..", e)
        throw new Error("while calling tool..")
      }
    } else if (request.params.name == 'query-ledgers') {
      try {
        const { companyId, customerId, fromDate, toDate } = request.params.arguments as { companyId?: string; customerId?: string; fromDate?: string; toDate?: string };

        if (!companyId && !customerId) return { content: [{ type: 'text', text: "Insufficient arguments" }] }

        const response = await fetch(
          `http://localhost:3000/get-ledger?companyId=${companyId || ""}&customerId=${customerId || ""}&fromDate=${fromDate || ""}&toDate=${toDate || ""}`
        );
        const result = await response.json();

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result)
            }
          ]
        }
      } catch (e) {
        console.log("while calling tool..", e)
        throw new Error("while calling tool..")
      }
    }
  })

  

  return mcp;
}