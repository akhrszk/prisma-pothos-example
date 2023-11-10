import { createServer } from "http";
import { createYoga } from "graphql-yoga";
import { useCookies } from "@whatwg-node/server-plugin-cookies";
import { schema } from "./schema";
import { CookieKeys } from "./const";
import { jwtVerify, parseID } from "./utils";
import { prisma } from "./db";

const yoga = createYoga({
  schema,
  context: async (ctx) => {
    const authToken =
      ctx.request.headers.get("Authorization")?.split(" ")?.[1] ||
      (await ctx.request.cookieStore?.get(CookieKeys.authToken))?.value;
    if (!authToken) {
      return { ...ctx };
    }
    const auth = jwtVerify(authToken);
    const user = await prisma.user.findUnique({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      where: { id: parseID(auth.sub!) },
    });
    return { ...ctx, user };
  },
  plugins: [useCookies()],
});

const server = createServer(yoga);

const port = process.env.PORT || "3000";

server.listen(port, () => {
  console.info(
    `Server is running on http://localhost:${port}${yoga.graphqlEndpoint}`,
  );
});
