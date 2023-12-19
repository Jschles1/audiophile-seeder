import sharp from "sharp";

async function convertToJpeg(inputPath: string, outputPath: string) {
  try {
    await sharp(inputPath).toFormat("jpeg").toFile(outputPath);

    console.log(`Converted ${inputPath} to ${outputPath}`);
  } catch (error) {
    console.error("Error during conversion:", error);
  }
}

async function convertImages() {
  try {
    const data = Bun.file("data.json");
    const json = await data.json();

    for (let product of json) {
      const { first, second, third } = product.gallery;

      const relatedProducts = product.others;

      const {
        mobile: mobileProductImage,
        desktop: desktopProductImage,
        tablet: tabletProductImage,
      } = product.image;
      const productImages = [
        mobileProductImage,
        tabletProductImage,
        desktopProductImage,
      ];

      const {
        mobile: mobileCategoryImage,
        desktop: desktopCategoryImage,
        tablet: tabletCategoryImage,
      } = product.categoryImage;
      const categoryImages = [
        mobileCategoryImage,
        tabletCategoryImage,
        desktopCategoryImage,
      ];

      const {
        mobile: mobileFirstImage,
        desktop: desktopFirstImage,
        tablet: tabletFirstImage,
      } = first;
      const firstGalleryImages = [
        mobileFirstImage,
        tabletFirstImage,
        desktopFirstImage,
      ];

      const {
        mobile: mobileSecondImage,
        desktop: desktopSecondImage,
        tablet: tabletSecondImage,
      } = second;
      const secondGalleryImages = [
        mobileSecondImage,
        tabletSecondImage,
        desktopSecondImage,
      ];

      const {
        mobile: mobileThirdImage,
        desktop: desktopThirdImage,
        tablet: tabletThirdImage,
      } = third;
      const thirdGalleryImages = [
        mobileThirdImage,
        tabletThirdImage,
        desktopThirdImage,
      ];

      // for (let addOn of productAddOns) {
      //   const {
      //     mobile: mobileAddOnImage,
      //     desktop: desktopAddOnImage,
      //     tablet: tabletAddOnImage,
      //   } = addOn.image;

      //   for (let image of [
      //     mobileAddOnImage,
      //     tabletAddOnImage,
      //     desktopAddOnImage,
      //   ]) {
      //     await convertToJpeg(
      //       image,
      //       image.split(".jpg")[0] + "_converted.jpeg"
      //     );
      //   }
      // }

      for (let relatedProduct of relatedProducts) {
        const {
          mobile: mobileRelatedProductImage,
          desktop: desktopRelatedProductImage,
          tablet: tabletRelatedProductImage,
        } = relatedProduct.image;

        for (let image of [
          mobileRelatedProductImage,
          tabletRelatedProductImage,
          desktopRelatedProductImage,
        ]) {
          await convertToJpeg(
            image,
            image.split(".jpg")[0] + "_converted.jpeg"
          );
        }
      }

      for (let image of productImages) {
        await convertToJpeg(image, image.split(".jpg")[0] + "_converted.jpeg");
      }

      for (let image of categoryImages) {
        await convertToJpeg(image, image.split(".jpg")[0] + "_converted.jpeg");
      }

      for (let image of firstGalleryImages) {
        await convertToJpeg(image, image.split(".jpg")[0] + "_converted.jpeg");
      }

      for (let image of secondGalleryImages) {
        await convertToJpeg(image, image.split(".jpg")[0] + "_converted.jpeg");
      }

      for (let image of thirdGalleryImages) {
        await convertToJpeg(image, image.split(".jpg")[0] + "_converted.jpeg");
      }

      console.log("Done");
    }
  } catch (error: any) {
    console.error(error);
  }
}

convertImages();
