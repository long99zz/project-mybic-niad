import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Product {
  product_id: number;
  name: string;
  image: string;
  price: number;
  sale_price: number;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
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
      const res = await axios.get(`${API_URL}/api/products`, { withCredentials: true });
      setProducts(res.data);
    } catch (err) {
      setError("Không thể tải dữ liệu sản phẩm.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Thêm sản phẩm mới (demo, bạn nên làm form riêng)
  const handleCreate = async () => {
    const name = prompt("Tên sản phẩm:");
    if (!name) return;
    try {
      await axios.post(
        `${API_URL}/api/products`,
        {
          name,
          price: 1000000,
          sale_price: 900000,
          quantity: 10,
          category_id: 1,
        },
        { withCredentials: true }
      );
      alert("Thêm sản phẩm thành công!");
      fetchProducts();
    } catch (err) {
      alert("Thêm sản phẩm thất bại!");
    }
  };

  // Sửa sản phẩm (demo, bạn nên làm form riêng)
  const handleEdit = async (productId: number) => {
    const name = prompt("Tên mới cho sản phẩm:");
    if (!name) return;
    try {
      await axios.put(
        `${API_URL}/api/products/${productId}`,
        { name },
        { withCredentials: true }
      );
      alert("Cập nhật sản phẩm thành công!");
      fetchProducts();
    } catch (err) {
      alert("Cập nhật sản phẩm thất bại!");
    }
  };

  // Xóa sản phẩm
  const handleDelete = async (productId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await axios.delete(`${API_URL}/api/products/${productId}`, { withCredentials: true });
      setProducts(products.filter((p) => p.product_id !== productId));
      alert("Xóa sản phẩm thành công!");
    } catch (err) {
      alert("Xóa sản phẩm thất bại!");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Đang tải dữ liệu sản phẩm...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Lỗi: {error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">Danh sách sản phẩm</h2>
      <div className="mb-4 flex justify-between items-center">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
          onClick={handleCreate}
        >
          Thêm sản phẩm
        </button>
        <input
          type="text"
          className="w-64 px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Tìm sản phẩm..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-50">
              <th className="p-2 text-center">#</th>
              <th className="p-2 text-center">Tên</th>
              <th className="p-2 text-center">Ảnh</th>
              <th className="p-2 text-center">Giá thường</th>
              <th className="p-2 text-center">Giá khuyến mãi</th>
              <th className="p-2 text-center">Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p, i) => (
              <tr key={p.product_id} className="border-b hover:bg-gray-50">
                <td className="p-2 text-center">{i + 1}</td>
                <td className="p-2 text-center">{p.name}</td>
                <td className="p-2 text-center">
                  <img
                    src={
                      p.image
                        ? `${API_URL}/upload/${p.image}`
                        : "https://via.placeholder.com/60"
                    }
                    alt={p.name}
                    className="w-14 h-10 object-cover rounded inline-block"
                  />
                </td>
                <td className="p-2 text-center">{p.price.toLocaleString()}₫</td>
                <td className="p-2 text-center text-red-600">
                  {p.sale_price.toLocaleString()}₫
                </td>
                <td className="p-2 space-x-2 text-center">
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition"
                    onClick={() => handleEdit(p.product_id)}
                  >
                    Sửa
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition"
                    onClick={() => handleDelete(p.product_id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;