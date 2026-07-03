/*
  Warnings:

  - You are about to drop the `PhoneOtp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PhoneOtp" DROP CONSTRAINT "PhoneOtp_userId_fkey";

-- DropTable
DROP TABLE "PhoneOtp";
