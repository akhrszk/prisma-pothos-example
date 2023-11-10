import { encodeGlobalID } from "@pothos/plugin-relay";
import { builder } from "../builder";
import { prisma } from "../db";
import { jwtSign, verifyPassword } from "../utils";
import { CookieKeys } from "../const";

const Me = builder.simpleObject("Me", {
  fields: (t) => ({
    userId: t.string({ nullable: false }),
    name: t.string({ nullable: false }),
    email: t.string({ nullable: false }),
    role: t.string({ nullable: false }),
  }),
});

const Login = builder.simpleObject("Login", {
  fields: (t) => ({
    token: t.string({ nullable: false }),
  }),
});

builder.queryFields((t) => ({
  me: t.field({
    type: Me,
    nullable: true,
    authScopes: { loggedIn: true },
    resolve: async (_, __, ctx) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.user?.id },
      });
      if (!user) {
        return null;
      }
      return {
        userId: encodeGlobalID("User", user.id),
        name: user.name,
        email: user.email,
        role: user.role,
      };
    },
  }),
}));

builder.mutationFields((t) => ({
  login: t.field({
    type: Login,
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      const userWithPassword = await prisma.user.findUnique({
        where: { email: args.email },
        include: { password: true },
      });
      if (!userWithPassword || !userWithPassword.password) {
        throw new Error("Failed login");
      }
      const isVerifiedPassword = await verifyPassword({
        rawPassword: args.password,
        hashedPassword: userWithPassword.password.hashed,
      });
      if (!isVerifiedPassword) {
        throw new Error("Failed login");
      }
      const token = jwtSign(userWithPassword.id);
      await ctx.request.cookieStore?.set(CookieKeys.authToken, token);
      return { token };
    },
  }),
}));
