import React, { useEffect, useState } from "react";
import {
  getInvoices,
  deleteInvoice,
  updateInvoiceStatus,
  Invoice,
} from "@/services/invoice";

const InvoiceAdmin: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error("Lỗi tải invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);


  const handleDelete = async (id: number, type: string) => {
    if (confirm("Bạn có chắc muốn xóa đơn hàng này?")) {
      if (type === "Chung") {
        await deleteInvoice(id);
      } else if (type === "Du lịch") {
        await deleteInvoice(id, "Du lịch");
      } else if (type === "Nhà") {
        await deleteInvoice(id, "Nhà");
      }
      fetchInvoices();
    }
  };

  const handleStatusChange = async (id: number, currentStatus: string, type: string) => {
    let nextStatus = "Chưa thanh toán";
    if (currentStatus === "Chưa thanh toán") nextStatus = "Đã thanh toán";
    else if (currentStatus === "Đã thanh toán") nextStatus = "Chưa thanh toán";

    if (type === "Chung") {
      await updateInvoiceStatus(id, nextStatus);
    } else if (type === "Du lịch") {
      await updateInvoiceStatus(id, nextStatus, "Du lịch");
    } else if (type === "Nhà") {
      await updateInvoiceStatus(id, nextStatus, "Nhà");
    }
    fetchInvoices();
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-bold">Quản lý Đơn hàng</h2>
      <table className="w-full border border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Sản phẩm</th>
            <th className="p-2 border">Người mua</th>
            <th className="p-2 border">Ngày tạo</th>
            <th className="p-2 border">Trạng thái</th>
            <th className="p-2 border">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => {
            console.log('invoice_type:', invoice.invoice_type, 'id:', invoice.invoice_id);
            return (
              <tr key={invoice.invoice_type + '-' + invoice.invoice_id}>
                <td className="p-2 border">{invoice.invoice_id}</td>
                <td className="p-2 border">{invoice.product_name}</td>
                <td className="p-2 border">{invoice.customer_name}</td>
                <td className="p-2 border">{invoice.updated_at ? new Date(invoice.updated_at).toLocaleDateString('vi-VN') : ''}</td>
                <td className="p-2 border">
                  <span
                    className={`px-2 py-1 rounded ${
                      invoice.status === "Pending"
                        ? "bg-yellow-200"
                        : invoice.status === "Approved"
                        ? "bg-green-200"
                        : "bg-red-200"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="flex gap-2 p-2 border">
                  <button
                    onClick={() =>
                      handleStatusChange(invoice.invoice_id, invoice.status, invoice.invoice_type)
                    }
                    className="px-3 py-1 text-white bg-blue-500 rounded"
                  >
                    Đổi trạng thái
                  </button>
                  <button
                    onClick={() => handleDelete(invoice.invoice_id, invoice.invoice_type)}
                    className="px-3 py-1 text-white bg-red-500 rounded"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceAdmin;
