import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom"; // Tạm thời bỏ Link nếu không cần điều hướng chi tiết

interface Product {
  id: number;
  name: string;
  img: string;
  price: number;
  sale: number;
}

interface Category {
  category_id: number;
  name: string;
}

const mockProducts = [
  {
    id: 1,
    name: "Laptop Acer Nitro V Gaming ANV15-51-55CA i5 13420H/16GB/512GB/15.6",
    img: "https://via.placeholder.com/60", // Placeholder image
    price: 27990000,
    sale: 25990000,
  },
  {
    id: 2,
    name: "NNPC Văn Phòng H510 Core i3, i5 10th / Window 10",
    img: "https://via.placeholder.com/60", // Placeholder image
    price: 6800000,
    sale: 6500000,
  },
];

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
      // TODO: Thay thế bằng lệnh gọi API thực tế
      console.log("Fetching products...");
      // const response = await fetch('/api/admin/products');
      // if (!response.ok) { throw new Error('Failed to fetch products'); }
      // const data = await response.json();
      // setProducts(data);

      // Mô phỏng độ trễ API và dữ liệu
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProducts(mockProducts);
      console.log("Products fetched:", mockProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Không thể tải dữ liệu sản phẩm.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Các hàm CRUD placeholder
  const handleCreate = () => {
    // TODO: Triển khai chức năng tạo sản phẩm mới (có thể dùng routing hoặc modal)
    console.log("Initiating product creation...");
    alert("Chức năng thêm sản phẩm mới");
  };

  const handleEdit = (productId: number) => {
    // TODO: Triển khai chức năng chỉnh sửa sản phẩm (có thể dùng routing hoặc modal)
    console.log("Editing product with ID:", productId);
    alert(`Chỉnh sửa sản phẩm ${productId}`);
  };

  const handleDelete = async (productId: number) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      // TODO: Thay thế bằng lệnh gọi API xóa thực tế
      console.log("Attempting to delete product with ID:", productId);
      try {
        // const response = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
        // if (!response.ok) { throw new Error('Failed to delete product'); }

        // Mô phỏng độ trễ API và cập nhật trạng thái
        await new Promise((resolve) => setTimeout(resolve, 300));
        setProducts(products.filter((product) => product.id !== productId));
        console.log("Product deleted with ID:", productId);
        alert("Xóa sản phẩm thành công!");
      } catch (err) {
        console.error("Error deleting product:", err);
        setError("Không thể xóa sản phẩm.");
        alert("Xóa sản phẩm thất bại!");
      }
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
        {/* Nút Thêm sản phẩm - dùng button hoặc Link tùy cấu trúc route thêm */}
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
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-2 text-center">{i + 1}</td>
                <td className="p-2 text-center">{p.name}</td>
                <td className="p-2 text-center">
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-14 h-10 object-cover rounded inline-block"
                  />
                </td>
                <td className="p-2 text-center">{p.price.toLocaleString()}₫</td>
                <td className="p-2 text-center text-red-600">
                  {p.sale.toLocaleString()}₫
                </td>
                <td className="p-2 space-x-2 text-center">
                  {/* <Link to={`/admin/products/edit/${p.id}`} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">Sửa</Link> */}
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition"
                    onClick={() => handleEdit(p.id)}
                  >
                    Sửa
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition"
                    onClick={() => handleDelete(p.id)}
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
