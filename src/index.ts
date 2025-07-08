import { Hono } from 'hono';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { getMcp } from './mcp';
import { toFetchResponse, toReqRes } from 'fetch-to-node'; //provides node.js compatible Request-Response Objects from hono's context object 

const app = new Hono();

app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*'); //specify allowed origin urls.. 
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Mcp-Session-Id');
  c.header('Access-Control-Expose-Headers', 'Mcp-Session-Id, WWW-Authenticate');

  if (c.req.method === 'OPTIONS') {
    return c.text('', 200);
  }

  //Auth logic here...

  await next();
});


app.post('/mcp', async (c) => {
  try {
    const { req, res } = toReqRes(c.req.raw)

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined    //if we're handling requests in a stateful manner then provide a sessionId generator - uuid or something
    })

    transport.onerror = console.error.bind(console); //for debugging

    const server = getMcp()
    await server.connect(transport)

    await transport.handleRequest(req, res, await c.req.json())
   
    return toFetchResponse(res);

  } catch (e: unknown) {
    console.log(e)
    return c.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      },
      { status: 500 }
    );
  }
});


export default app;
