import { useState, useEffect } from "react";
import { getAllProducts, deleteProduct, AdminProduct } from "@/services/admin";

const Products = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Không thể tải dữ liệu sản phẩm.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Chưa có giá";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Các hàm CRUD
  const handleCreate = () => {
    alert("Chức năng thêm sản phẩm mới đang được phát triển");
  };

  const handleEdit = (productId: number) => {
    alert(`Chỉnh sửa sản phẩm ${productId} - Đang phát triển`);
  };

  const handleDelete = async (productId: number, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`)) return;

    try {
      await deleteProduct(productId);
      alert("Xóa sản phẩm thành công!");
      fetchProducts(); // Reload
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Không thể xóa sản phẩm");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Danh sách sản phẩm</h2>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
            onClick={handleCreate}
          >
            + Thêm sản phẩm
          </button>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition"
          >
            🔄 Làm mới
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Tìm sản phẩm theo tên..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-50">
              <th className="p-2 text-center">#</th>
              <th className="p-2 text-left">Tên sản phẩm</th>
              <th className="p-2 text-center">Ảnh</th>
              <th className="p-2 text-center">Giá</th>
              <th className="p-2 text-center">Danh mục</th>
              <th className="p-2 text-center">Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.product_id} className="border-b hover:bg-gray-50">
                <td className="p-2 text-center">{product.product_id}</td>
                <td className="p-2">
                  <div className="font-medium">{product.name}</div>
                  {product.description && (
                    <div className="text-xs text-gray-500 line-clamp-1">
                      {product.description}
                    </div>
                  )}
                </td>
                <td className="p-2 text-center">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded inline-block"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded inline-flex items-center justify-center">
                      📦
                    </div>
                  )}
                </td>
                <td className="p-2 text-center font-medium">
                  {formatCurrency(product.price)}
                </td>
                <td className="p-2 text-center">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                    ID: {product.category_id || "N/A"}
                  </span>
                </td>
                <td className="p-2 text-center space-x-2">
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                    onClick={() => handleEdit(product.product_id)}
                  >
                    Sửa
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    onClick={() => handleDelete(product.product_id, product.name)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && !loading && (
          <div className="py-12 text-center text-gray-500">
            {searchKeyword ? "Không tìm thấy sản phẩm nào" : "Chưa có sản phẩm"}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
