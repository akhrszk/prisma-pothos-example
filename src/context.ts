import { type YogaInitialContext } from "graphql-yoga";
import { type User } from "../prisma/client";

export interface Context extends YogaInitialContext {
  user?: User;
}
