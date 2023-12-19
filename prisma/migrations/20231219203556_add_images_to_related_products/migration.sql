/*
  Warnings:

  - Added the required column `desktopImage` to the `RelatedProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobileImage` to the `RelatedProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tabletImage` to the `RelatedProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RelatedProduct" ADD COLUMN     "desktopImage" TEXT NOT NULL,
ADD COLUMN     "mobileImage" TEXT NOT NULL,
ADD COLUMN     "tabletImage" TEXT NOT NULL;
