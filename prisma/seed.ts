import { hashPassword } from "../src/utils";
import { type PostStatus, PrismaClient } from "./client";
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient();

async function main() {
  const users = Array.from({ length: 10 })
    .map((_, i) => ({
      id: i + 1,
      email: faker.internet.email(),
      name: faker.person.fullName(),
    }));
  const posts = Array.from({ length: 30 })
    .map((_, i) => ({
      id: i + 1,
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
      status: Math.floor(Math.random() * 10) % 4 === 0 ? "DRAFT" : "PUBLIC",
      authorId: Math.floor(Math.random() * 10) + 1,
    }));

  const hashedPassword = await hashPassword("password");

  await Promise.all(users.map(user =>
    prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        password: {
          create: {
            hashed: hashedPassword,
          }
        }
      },
    })
  ));

  await Promise.all(posts.map(post => prisma.post.upsert({
      where: { id: post.id },
      update: {},
      create: {
        id: post.id,
        title: post.title,
        content: post.content,
        status: post.status as PostStatus,
        authorId: post.authorId,
      },
    })
  ));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });