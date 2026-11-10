import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";

/** Sirve las funciones de /api (formato Vercel: export GET/POST(request)) durante `vite dev`. */
function apiDev(): Plugin {
  return {
    name: "sessanta-api-dev",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        if (!url.pathname.startsWith("/api/")) return next();
        const name = url.pathname.slice(5).replace(/[^a-z0-9-]/gi, "");
        try {
          let mod: Record<string, unknown>;
          try {
            mod = await server.ssrLoadModule(`/api/${name}.ts`);
          } catch (error) {
            if (String(error).includes("Failed to load url")) { res.statusCode = 404; return res.end("Not found"); }
            throw error;
          }
          const handler = mod[req.method ?? "GET"] as ((request: Request) => Promise<Response>) | undefined;
          if (!handler) { res.statusCode = 405; return res.end("Method not allowed"); }
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
          const hasBody = req.method !== "GET" && req.method !== "HEAD";
          const request = new Request(`http://${req.headers.host}${req.url}`, { method: req.method, headers, body: hasBody ? Buffer.concat(chunks) : undefined });
          const response = await handler(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ error: "Error interno" }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, { ...loadEnv(mode, process.cwd(), ""), ...process.env });
  return { plugins: [react(), apiDev()], server: { host: "0.0.0.0", port: Number(process.env.PORT) || 3000 } };
});
