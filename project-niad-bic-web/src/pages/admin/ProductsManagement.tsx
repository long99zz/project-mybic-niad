import { useEffect, useState } from 'react';
import { getAllProducts, deleteProduct, AdminProduct } from '@/services/admin';
import { Trash2, Edit, Plus, Search } from 'lucide-react';

export default function ProductsManagement() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`)) return;

    try {
      await deleteProduct(id);
      alert('Xóa sản phẩm thành công!');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Không thể xóa sản phẩm');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý Sản phẩm</h1>
        <div className="flex gap-2">
          <button
            onClick={() => alert('Tính năng thêm sản phẩm đang phát triển')}
            className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            <Plus className="w-5 h-5" />
            Thêm sản phẩm
          </button>
          <button
            onClick={loadProducts}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
        <input
          type="text"
          placeholder="Tìm sản phẩm theo tên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-600">Tổng sản phẩm</div>
          <div className="text-2xl font-bold">{products.length}</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-600">Kết quả tìm kiếm</div>
          <div className="text-2xl font-bold text-blue-600">{filteredProducts.length}</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-600">Danh mục</div>
          <div className="text-2xl font-bold text-purple-600">
            {new Set(products.map((p) => p.category_id)).size}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <div key={product.product_id} className="overflow-hidden bg-white rounded-lg shadow-md">
            {/* Product Image */}
            <div className="relative h-48 overflow-hidden bg-gray-200">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400">
                  <span className="text-4xl">📦</span>
                </div>
              )}
              <div className="absolute px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded top-2 right-2">
                ID: {product.product_id}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">
                {product.name}
              </h3>
              {product.description && (
                <p className="mb-3 text-sm text-gray-600 line-clamp-2">{product.description}</p>
              )}

              <div className="flex items-center justify-between mb-3">
                {product.price && (
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(product.price)}
                  </div>
                )}
                {product.category_id && (
                  <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                    Category #{product.category_id}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => alert('Chỉnh sửa sản phẩm: ' + product.product_id)}
                  className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm text-yellow-700 transition bg-yellow-100 rounded hover:bg-yellow-200"
                >
                  <Edit className="w-4 h-4" />
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(product.product_id, product.name)}
                  className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm text-red-700 transition bg-red-100 rounded hover:bg-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-12 text-center text-gray-500 bg-white rounded-lg shadow">
          Không tìm thấy sản phẩm nào
        </div>
      )}
    </div>
  );
}
