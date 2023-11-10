import { DateTimeResolver } from "graphql-scalars";
import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import RelayPlugin from "@pothos/plugin-relay";
import SimpleObjectsPlugin from "@pothos/plugin-simple-objects";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";
import type PrismaTypes from "../prisma/generated";
import { prisma } from "./db";
import { type Context } from "./context";
import { Prisma } from "../prisma/client";

export const builder = new SchemaBuilder<{
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
  };
  AuthScopes: {
    loggedIn: boolean;
    member: boolean;
    admin: boolean;
  };
  PrismaTypes: PrismaTypes;
  Context: Context;
}>({
  plugins: [ScopeAuthPlugin, PrismaPlugin, RelayPlugin, SimpleObjectsPlugin],
  authScopes: async (ctx) => ({
    loggedIn: !!ctx.user,
    admin: ctx.user?.role === "ADMIN",
    member: ctx.user?.role === "MEMBER",
  }),
  relayOptions: {},
  prisma: {
    client: prisma,
    dmmf: Prisma.dmmf,
  },
});

builder.queryType();
builder.mutationType();

builder.addScalarType("DateTime", DateTimeResolver, {});
