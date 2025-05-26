import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CustomerSupport from "../components/CustomerSupport";
import { useNavigate } from "react-router-dom";

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  isSelected: boolean;
}

export default function CartPage() {
  const navigate = useNavigate();

  const [cartItem, setCartItem] = useState<CartItem | null>({
    id: "MVL",
    name: "Bảo hiểm TNDS Bắt buộc Của Chủ Xe Ô tô",
    description: "An tâm trên mọi nẻo đường!",
    price: 530700,
    image: "/products/banner1.png",
    buyerName: "Nguyễn Bá Hoàng Long",
    buyerPhone: "0866107085",
    buyerEmail: "zzdragon14@gmail.com",
    isSelected: true,
  });

  const handleRemoveItem = () => {
    setCartItem(null);
  };

  const handleToggleSelect = () => {
    if (cartItem) {
      setCartItem({ ...cartItem, isSelected: !cartItem.isSelected });
    }
  };

  const totalAmount = cartItem && cartItem.isSelected ? cartItem.price : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-red-600">
          Giỏ hàng
        </h1>

        {cartItem === null ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              Giỏ hàng của bạn hiện không có sản phẩm nào!
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 mx-auto">
            <div className="grid grid-cols-[auto,auto,1.5fr,1fr,auto,auto] gap-4 items-center pb-3 border-b border-gray-200 text-gray-600 font-semibold">
              <div className="w-6 flex justify-center items-center"></div>
              <div className="w-24">Hình ảnh</div>
              <div>Tên sản phẩm</div>
              <div>Người mua</div>
              <div className="text-right">Thành tiền (gồm VAT)</div>
              <div className="w-16 text-center"></div>
            </div>

            <div className="grid grid-cols-[auto,auto,1.5fr,1fr,auto,auto] gap-4 items-start py-4 border-b border-gray-200">
              <div className="w-6 flex justify-center items-start mt-1">
                <input
                  type="checkbox"
                  checked={cartItem.isSelected}
                  onChange={handleToggleSelect}
                  className="form-checkbox text-red-600 rounded cursor-pointer"
                />
              </div>
              <div className="w-24">
                <img
                  src={cartItem.image}
                  alt={cartItem.name}
                  className="w-full h-auto object-cover rounded"
                />
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">{cartItem.name}</h3>
                <p className="text-gray-600 text-sm">{cartItem.description}</p>
                {cartItem && (
                  <button
                    onClick={() => navigate(`/mua-bao-hiem/${cartItem.id}`)}
                    className="text-red-600 text-sm mt-1 hover:underline p-0"
                  >
                    [Sửa thông tin]
                  </button>
                )}
              </div>
              <div className="text-gray-700">
                <p className="font-medium">{cartItem.buyerName}</p>
                <p className="text-sm">{cartItem.buyerPhone}</p>
                <p className="text-sm">{cartItem.buyerEmail}</p>
              </div>
              <div className="font-bold text-red-600 text-right">
                {new Intl.NumberFormat("vi-VN").format(cartItem.price)} VNĐ
              </div>
              <div className="w-16 flex justify-center items-start mt-1">
                <button
                  onClick={handleRemoveItem}
                  className="text-red-600 hover:text-red-700 text-sm leading-none"
                >
                  Xóa đơn hàng
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <div className="text-right">
                <span className="text-lg font-bold text-gray-700 mr-2">
                  Tổng phí (gồm VAT):
                </span>
                <span className="text-2xl font-bold text-red-600">
                  {new Intl.NumberFormat("vi-VN").format(totalAmount)} VNĐ
                </span>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={() => navigate("/thanh-toan")}
                className={`px-12 py-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors uppercase font-bold text-lg ${
                  !cartItem || !cartItem.isSelected
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={!cartItem || !cartItem.isSelected}
              >
                Thanh toán
              </button>
            </div>
          </div>
        )}
      </div>
      <CustomerSupport />
      <Footer />
    </div>
  );
}
