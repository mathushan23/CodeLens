import prisma from "./prismaClient.js";

export const findUserById = async (id) => {
  return prisma.user.findUnique({ where: { id: Number(id) } });
};

export const upsertGithubUser = async (profile) => {
  const githubId = profile.id?.toString();
  const email = profile.emails?.[0]?.value;

  return prisma.user.upsert({
    where: { githubId },
    update: {
      username: profile.username || profile.displayName || "",
      email,
      avatarUrl: profile.photos?.[0]?.value || undefined,
    },
    create: {
      githubId,
      username: profile.username || profile.displayName || "",
      email,
      avatarUrl: profile.photos?.[0]?.value || undefined,
    },
  });
};
