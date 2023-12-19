export interface ImageObject {
  mobile?: string;
  desktop?: string;
  tablet?: string;
}

export interface RelatedProduct {
  name: string;
  slug: string;
  image: { mobile: string; tablet: string; desktop: string };
}
