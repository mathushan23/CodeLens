import prisma from "./prismaClient.js";

export const createReview = async (data) => {
  return prisma.review.create({ data });
};

export const findReviewById = async (id) => {
  return prisma.review.findUnique({ where: { id: Number(id) }, include: { issues: true } });
};

export const findReviewsByUserId = async (userId) => {
  return prisma.review.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
};
