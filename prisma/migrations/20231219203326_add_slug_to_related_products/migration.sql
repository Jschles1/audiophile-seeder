/*
  Warnings:

  - You are about to drop the column `quantity` on the `RelatedProduct` table. All the data in the column will be lost.
  - Added the required column `slug` to the `RelatedProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RelatedProduct" DROP COLUMN "quantity",
ADD COLUMN     "slug" TEXT NOT NULL;
