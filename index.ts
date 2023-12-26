import { PrismaClient } from "@prisma/client";
import { ImageObject, RelatedProduct } from "./interfaces";
import groupUploadImages from "./upload-images";

declare global {
  namespace Process {
    interface Env {
      CLOUDFLARE_ACCOUNT_ID: string;
      CLOUDFLARE_API_TOKEN: string;
    }
  }
}

const prismadb = new PrismaClient();

async function main() {
  try {
    console.log("Starting");
    const data = Bun.file("data.json");
    const json = await data.json();
    await prismadb.$connect();

    for (let product of json) {
      // Get category info
      const categoryName = product.category;
      const existingCategory = await prismadb.category.findFirst({
        where: { name: categoryName },
      });

      const categoryExists = existingCategory !== null;

      const categoryToInsert = {
        name: categoryName,
        mobileCategoryImage: "",
        tabletCategoryImage: "",
        desktopCategoryImage: "",
      };
      const productToInsert = {
        name: product.name,
        description: product.description,
        price: product.price,
        slug: product.slug,
        features: product.features,
        new: product.new,
        mobileImage: "",
        tabletImage: "",
        desktopImage: "",
        imageGallery: "",
      };
      const relatedProducts = product.others;
      const parsedRelatedProducts: RelatedProduct[] = [];
      const productAddOns = product.includes;
      const imageGallery: { [key: string]: ImageObject } = {
        first: {},
        second: {},
        third: {},
      };
      const { first, second, third } = product.gallery;

      // Upload images to cloudflare
      await groupUploadImages(product.image, (urls) => {
        productToInsert.mobileImage = urls[0];
        productToInsert.tabletImage = urls[1];
        productToInsert.desktopImage = urls[2];
      });

      await groupUploadImages(first, (urls) => {
        imageGallery.first.mobile = urls[0];
        imageGallery.first.tablet = urls[1];
        imageGallery.first.desktop = urls[2];
      });

      await groupUploadImages(second, (urls) => {
        imageGallery.second.mobile = urls[0];
        imageGallery.second.tablet = urls[1];
        imageGallery.second.desktop = urls[2];
      });

      await groupUploadImages(third, (urls) => {
        imageGallery.third.mobile = urls[0];
        imageGallery.third.tablet = urls[1];
        imageGallery.third.desktop = urls[2];
      });

      imageGallery.first = imageGallery.first;
      imageGallery.second = imageGallery.second;
      imageGallery.third = imageGallery.third;

      productToInsert.imageGallery = JSON.stringify(imageGallery);

      for (let relatedProduct of relatedProducts) {
        const parsedRelatedProduct: RelatedProduct = { ...relatedProduct };
        await groupUploadImages(relatedProduct.image, (urls) => {
          parsedRelatedProduct.image.mobile = urls[0];
          parsedRelatedProduct.image.tablet = urls[1];
          parsedRelatedProduct.image.desktop = urls[2];
          parsedRelatedProducts.push(parsedRelatedProduct);
        });
      }

      if (!categoryExists) {
        await groupUploadImages(product.categoryImage, (urls) => {
          categoryToInsert.mobileCategoryImage = urls[0];
          categoryToInsert.tabletCategoryImage = urls[1];
          categoryToInsert.desktopCategoryImage = urls[2];
        });
      }

      const categoryInsertionObject = categoryExists
        ? {
            connectOrCreate: {
              where: { id: existingCategory?.id },
              create: {
                name: categoryToInsert.name,
                mobileCategoryImage: categoryToInsert.mobileCategoryImage,
                tabletCategoryImage: categoryToInsert.tabletCategoryImage,
                desktopCategoryImage: categoryToInsert.desktopCategoryImage,
              },
            },
          }
        : {
            create: [
              {
                name: categoryToInsert.name,
                mobileCategoryImage: categoryToInsert.mobileCategoryImage,
                tabletCategoryImage: categoryToInsert.tabletCategoryImage,
                desktopCategoryImage: categoryToInsert.desktopCategoryImage,
              },
            ],
          };

      // Insert product into database
      console.log("Inserting " + productToInsert.name + "...");
      console.log("Image gallery: ", productToInsert.imageGallery);
      const insertionResult = await prismadb.product.create({
        data: {
          ...productToInsert,
          categories: categoryInsertionObject,
          addOns: {
            create: productAddOns,
          },
          relatedProducts: {
            create: [
              {
                name: parsedRelatedProducts[0].name,
                slug: parsedRelatedProducts[0].slug,
                mobileImage: parsedRelatedProducts[0].image.mobile,
                tabletImage: parsedRelatedProducts[0].image.tablet,
                desktopImage: parsedRelatedProducts[0].image.desktop,
              },
              {
                name: parsedRelatedProducts[1].name,
                slug: parsedRelatedProducts[1].slug,
                mobileImage: parsedRelatedProducts[1].image.mobile,
                tabletImage: parsedRelatedProducts[1].image.tablet,
                desktopImage: parsedRelatedProducts[1].image.desktop,
              },
              {
                name: parsedRelatedProducts[2].name,
                slug: parsedRelatedProducts[2].slug,
                mobileImage: parsedRelatedProducts[2].image.mobile,
                tabletImage: parsedRelatedProducts[2].image.tablet,
                desktopImage: parsedRelatedProducts[2].image.desktop,
              },
            ],
          },
        },
      });

      if (insertionResult) {
        console.log("Product inserted successfully.");
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function drop() {
  await prismadb.$connect();
  await prismadb.relatedProduct.deleteMany({});
  await prismadb.productAddOn.deleteMany({});
  await prismadb.product.deleteMany({});
  await prismadb.category.deleteMany({});
  await prismadb.$disconnect();
}

// Fix for https://github.com/prisma/prisma/issues/21108
await main()
  .then(async () => {
    await prismadb.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prismadb.$disconnect();
    process.exit(1);
  });
