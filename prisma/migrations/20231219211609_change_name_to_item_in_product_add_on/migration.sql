/*
  Warnings:

  - You are about to drop the column `name` on the `ProductAddOn` table. All the data in the column will be lost.
  - Added the required column `item` to the `ProductAddOn` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductAddOn" DROP COLUMN "name",
ADD COLUMN     "item" TEXT NOT NULL;
