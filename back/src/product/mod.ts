import { getProductsSetup } from "./getProducts/mod.ts";
import { getProductSetup } from "./getProduct/mod.ts";
import { createProductSetup } from "./createProduct/mod.ts";
import { updateProductSetup } from "./updateProduct/mod.ts";
import { getFeaturedProductsSetup } from "./getFeaturedProducts/mod.ts";
import { getProductFiltersSetup } from "./getProductFilters/mod.ts";
import { purchaseProductSetup } from "./purchaseProduct/mod.ts";
import { seedProductsSetup } from "./seedProducts/mod.ts";

export const productSetup = () => {
  getProductsSetup();
  getProductSetup();
  createProductSetup();
  updateProductSetup();
  getFeaturedProductsSetup();
  getProductFiltersSetup();
  purchaseProductSetup();
  seedProductsSetup();
};

// Export service for other modules
export { productService } from "./productService.ts";
