import { decodeGlobalID } from "@pothos/plugin-relay";
import { builder } from "../builder";
import { parseID } from "../utils";
import { prisma } from "../db";

const User = builder.prismaNode("User", {
  id: { field: "id" },
  findUnique: (id) => ({ id: parseID(id) }),
  fields: (t) => ({
    name: t.exposeString("name"),
    email: t.exposeString("email", {
      authScopes: { admin: true, member: true },
    }),
    role: t.exposeString("role"),
    posts: t.relatedConnection("posts", {
      cursor: "id",
      totalCount: true,
    }),
  }),
});

builder.queryFields((t) => ({
  user: t.prismaField({
    type: "User",
    nullable: true,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: (query, _, args) => {
      const { id } = decodeGlobalID(args.id as string);
      return prisma.user.findUnique({
        ...query,
        where: { id: parseInt(id, 10) },
      });
    },
  }),
  users: t.prismaConnection({
    type: "User",
    cursor: "id",
    resolve: (query) => prisma.user.findMany({ ...query }),
    totalCount: () => prisma.user.count(),
  }),
}));

const UpdateUserInput = builder.inputType("UpdateUser", {
  fields: (t) => ({
    name: t.string({ required: true }),
  }),
});

builder.mutationField("updateUser", (t) =>
  t.prismaField({
    type: User,
    args: {
      input: t.arg({ type: UpdateUserInput, required: true }),
    },
    authScopes: { loggedIn: true },
    resolve: (query, _, { input }, ctx) => {
      if (!ctx.user) {
        throw new Error("required ctx.user");
      }
      return prisma.user.update({
        ...query,
        where: { id: ctx.user.id },
        data: {
          ...input,
        },
      });
    },
  }),
);

const UserRole = builder.enumType("UserRole", {
  values: ["MEMBER", "ADMIN"] as const,
});

const updateUserRoleInput = builder.inputType("UpdateUserRole", {
  fields: (t) => ({
    userId: t.string({ required: true }),
    role: t.field({ type: UserRole, required: true }),
  }),
});

builder.mutationField("updateUserRole", (t) =>
  t.prismaField({
    type: User,
    args: {
      input: t.arg({ type: updateUserRoleInput, required: true }),
    },
    authScopes: { admin: true },
    resolve: (query, _, { input }) =>
      prisma.user.update({
        ...query,
        where: { id: parseID(input.userId) },
        data: { role: input.role },
      }),
  }),
);
