/*
  Warnings:

  - A unique constraint covering the columns `[polarCustomerId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subscriptionId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING');

-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('CREDIT_PURCHASE', 'SUBSCRIPTION_PAYMENT', 'REFUND');

-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "billingPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "monthlyCreditsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "polarCustomerId" TEXT,
ADD COLUMN     "subscriptionId" TEXT,
ADD COLUMN     "subscriptionStatus" "public"."SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
ADD COLUMN     "subscriptionTier" TEXT DEFAULT 'free',
ADD COLUMN     "usageResetDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" TEXT NOT NULL,
    "polarOrderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."TransactionType" NOT NULL,
    "credits" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "public"."TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usage_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_polarOrderId_key" ON "public"."transactions"("polarOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "users_polarCustomerId_key" ON "public"."users"("polarCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "users_subscriptionId_key" ON "public"."users"("subscriptionId");

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usage_events" ADD CONSTRAINT "usage_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
