/* eslint-disable */
import type { Prisma, User, Password, Post } from "./client";
export default interface PrismaTypes {
    User: {
        Name: "User";
        Shape: User;
        Include: Prisma.UserInclude;
        Select: Prisma.UserSelect;
        OrderBy: Prisma.UserOrderByWithRelationInput;
        WhereUnique: Prisma.UserWhereUniqueInput;
        Where: Prisma.UserWhereInput;
        Create: {};
        Update: {};
        RelationName: "password" | "posts";
        ListRelations: "posts";
        Relations: {
            password: {
                Shape: Password | null;
                Name: "Password";
            };
            posts: {
                Shape: Post[];
                Name: "Post";
            };
        };
    };
    Password: {
        Name: "Password";
        Shape: Password;
        Include: Prisma.PasswordInclude;
        Select: Prisma.PasswordSelect;
        OrderBy: Prisma.PasswordOrderByWithRelationInput;
        WhereUnique: Prisma.PasswordWhereUniqueInput;
        Where: Prisma.PasswordWhereInput;
        Create: {};
        Update: {};
        RelationName: "user";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Name: "User";
            };
        };
    };
    Post: {
        Name: "Post";
        Shape: Post;
        Include: Prisma.PostInclude;
        Select: Prisma.PostSelect;
        OrderBy: Prisma.PostOrderByWithRelationInput;
        WhereUnique: Prisma.PostWhereUniqueInput;
        Where: Prisma.PostWhereInput;
        Create: {};
        Update: {};
        RelationName: "author";
        ListRelations: never;
        Relations: {
            author: {
                Shape: User;
                Name: "User";
            };
        };
    };
}