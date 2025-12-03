/**
 * Product ID to Product Name Mapping
 * Source: BIC Insurance Database
 * Last Updated: 2025-11-09
 */

export const PRODUCT_MAP: Record<number, string> = {
  6: "Bảo hiểm trách nhiệm dân sự chủ xe ô tô",
  7: "Bảo hiểm vật chất ô tô",
  8: "Bảo hiểm trách nhiệm dân sự chủ xe máy",
  9: "Bảo hiểm bệnh ung thư/",
  10: "Bảo hiểm tai nạn và sức khỏe cá nhân",
  11: "Bảo hiểm du lịch quốc tế (ITI)",
  12: "Bảo hiểm du lịch trong nước (TRV)",
  13: "Bảo hiểm tai nạn khách du lịch (TVC)",
  14: "Bảo hiểm tai nạn con người 24/24",
  15: "Bảo hiểm tai nạn người sử dụng điện",
  16: "Bảo hiểm tai nạn mở rộng",
  17: "Bảo hiểm nhà tư nhân",
  18: "Bảo hiểm an ninh mạng",
};

/**
 * Get product name by product ID
 * @param productId - The product ID to lookup
 * @returns Product name or "Sản phẩm không tồn tại" if not found
 */
export const getProductName = (productId: number | string): string => {
  const id = typeof productId === "string" ? parseInt(productId, 10) : productId;
  return PRODUCT_MAP[id] || "Sản phẩm không tồn tại";
};

/**
 * Get all product IDs
 * @returns Array of all product IDs
 */
export const getAllProductIds = (): number[] => {
  return Object.keys(PRODUCT_MAP).map((id) => parseInt(id, 10));
};

/**
 * Check if product ID exists
 * @param productId - The product ID to check
 * @returns true if product exists, false otherwise
 */
export const isValidProductId = (productId: number | string): boolean => {
  const id = typeof productId === "string" ? parseInt(productId, 10) : productId;
  return id in PRODUCT_MAP;
};
