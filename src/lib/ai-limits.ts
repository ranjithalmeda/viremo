import { prisma } from "@/src/lib/prisma";

export const proAiLimitKey = "proDailyAiLimit";
const defaultProDailyAiLimit = 3;

export async function getProDailyAiLimit() {
  const config = await prisma.appConfig.findUnique({
    where: { key: proAiLimitKey },
  });
  const parsed = Number(config?.value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : defaultProDailyAiLimit;
}

export async function setProDailyAiLimit(limit: number) {
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
  const config = await prisma.appConfig.upsert({
    where: { key: proAiLimitKey },
    update: { value: String(safeLimit) },
    create: { key: proAiLimitKey, value: String(safeLimit) },
  });

  return Number(config.value);
}

function nextResetAt() {
  const resetAt = new Date();
  resetAt.setDate(resetAt.getDate() + 1);
  resetAt.setHours(0, 0, 0, 0);
  return resetAt;
}

export async function getAiUsageForUser(userId: string) {
  const limit = await getProDailyAiLimit();
  const now = new Date();
  let usage = await prisma.aiUsage.findUnique({ where: { userId } });

  if (!usage || usage.resetAt <= now) {
    usage = await prisma.aiUsage.upsert({
      where: { userId },
      update: { count: 0, resetAt: nextResetAt() },
      create: { userId, count: 0, resetAt: nextResetAt() },
    });
  }

  return {
    count: usage.count,
    limit,
    resetAt: usage.resetAt,
    remaining: Math.max(0, limit - usage.count),
  };
}

export async function consumeAiUsage(userId: string) {
  const usage = await getAiUsageForUser(userId);

  if (usage.count >= usage.limit) {
    return { ...usage, allowed: false };
  }

  const updated = await prisma.aiUsage.update({
    where: { userId },
    data: { count: { increment: 1 } },
  });

  return {
    count: updated.count,
    limit: usage.limit,
    resetAt: updated.resetAt,
    remaining: Math.max(0, usage.limit - updated.count),
    allowed: true,
  };
}
