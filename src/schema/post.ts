import { decodeGlobalID } from "@pothos/plugin-relay";
import { builder } from "../builder";
import { parseID } from "../utils";
import { prisma } from "../db";

builder.prismaNode("Post", {
  id: { field: "id" },
  findUnique: (id) => ({ id: parseID(id) }),
  fields: (t) => ({
    title: t.exposeString("title"),
    content: t.exposeString("content"),
    author: t.relation("author"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.queryFields((t) => ({
  post: t.prismaField({
    type: "Post",
    nullable: true,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (query, _, args) => {
      const { id } = decodeGlobalID(args.id as string);
      return await prisma.post.findUnique({
        ...query,
        where: { id: parseInt(id, 10) },
      });
    },
  }),
  posts: t.prismaConnection({
    type: "Post",
    cursor: "id",
    resolve: (query) => prisma.post.findMany({ ...query }),
    totalCount: () => prisma.post.count(),
  }),
}));

const PostStatus = builder.enumType("PostStatus", {
  values: ["DRAFT", "PUBLIC"] as const,
});

const CreatePostInput = builder.inputType("CreatePost", {
  fields: (t) => ({
    title: t.string({ required: true }),
    content: t.string({ required: true }),
    status: t.field({ type: PostStatus, required: true }),
  }),
});

const UpdatePostInput = builder.inputType("UpdatePost", {
  fields: (t) => ({
    postId: t.id({ required: true }),
    post: t.field({ type: CreatePostInput, required: true }),
  }),
});

builder.mutationFields((t) => ({
  createPost: t.prismaField({
    type: "Post",
    args: {
      input: t.arg({ type: CreatePostInput, required: true }),
    },
    authScopes: { member: true, admin: true },
    resolve: (query, _, { input }, ctx) => {
      if (!ctx.user) {
        throw new Error("required ctx.user");
      }
      return prisma.post.create({
        ...query,
        data: {
          ...input,
          authorId: ctx.user.id,
        },
      });
    },
  }),
  updatePost: t.prismaField({
    type: "Post",
    args: {
      input: t.arg({ type: UpdatePostInput, required: true }),
    },
    authScopes: async (_, args, ctx) => {
      const post = await prisma.post.findUnique({
        where: { id: parseID(args.input.postId) },
      });
      if (post?.authorId === ctx.user?.id) {
        return true;
      }
      return { admin: true };
    },
    resolve: (query, _, { input }, ctx) => {
      if (!ctx.user) {
        throw new Error("required ctx.user");
      }
      return prisma.post.update({
        ...query,
        where: { id: parseID(input.postId) },
        data: {
          ...input,
          authorId: ctx.user.id,
        },
      });
    },
  }),
}));
