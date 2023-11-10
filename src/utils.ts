import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { decodeGlobalID, encodeGlobalID } from "@pothos/plugin-relay";
import { signingKey } from "./const";

export const parseID = (id: string | number) => {
  const { id: rawID } = decodeGlobalID(String(id));
  return Number.parseInt(rawID, 10);
};

export const hashPassword = (rawPassword: string) => {
  const saltRounds = 10;
  return bcrypt.hash(rawPassword, saltRounds);
};

export const verifyPassword = (args: {
  rawPassword: string;
  hashedPassword: string;
}) => {
  const { rawPassword, hashedPassword } = args;
  return bcrypt.compare(rawPassword, hashedPassword);
};

export const jwtSign = (userId: number, payload: object = {}) => {
  return jwt.sign(payload, signingKey, {
    subject: encodeGlobalID("User", userId),
  });
};

export const jwtVerify = (token: string): JwtPayload => {
  return jwt.verify(token, signingKey) as JwtPayload;
};
