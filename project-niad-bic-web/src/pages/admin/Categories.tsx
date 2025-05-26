import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface Category {
  category_id: number;
  name: string;
  description: string;
  parent_id: number | null;
  created_at: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // TODO: Gọi API lấy danh sách danh mục
    // Ví dụ:
    // fetch('/api/admin/categories')
    //     .then(res => res.json())
    //     .then(data => setCategories(data));

    // Tạm thời mock dữ liệu
    setCategories([
      {
        category_id: 1,
        name: "Điện thoại",
        description: "Danh mục điện thoại",
        parent_id: null,
        created_at: "2024-03-20",
      },
      {
        category_id: 2,
        name: "Laptop",
        description: "Danh mục laptop",
        parent_id: null,
        created_at: "2024-03-20",
      },
    ]);
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        // TODO: Gọi API xóa danh mục
        // Ví dụ:
        // await fetch(`/api/admin/categories/${id}`, {
        //     method: 'DELETE'
        // });

        // Tạm thời mock xóa danh mục
        setCategories((prev) =>
          prev.filter((category) => category.category_id !== id)
        );
        alert("Xóa danh mục thành công");
      } catch (err) {
        setError("Có lỗi xảy ra khi xóa danh mục");
      }
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="container-fluid pt-4 px-4">
      <div className="bg-light text-center rounded p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h6 className="mb-0">Quản lý danh mục</h6>
          <Link to="/admin/categories/add" className="btn btn-custom">
            <i className="fa fa-plus"></i> Thêm danh mục
          </Link>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm danh mục..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table className="table text-start align-middle table-bordered table-hover mb-0">
            <thead>
              <tr className="text-dark">
                <th scope="col">#</th>
                <th scope="col">Tên danh mục</th>
                <th scope="col">Mô tả</th>
                <th scope="col">Danh mục cha</th>
                <th scope="col">Ngày tạo</th>
                <th scope="col">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.category_id}>
                  <td>{category.category_id}</td>
                  <td>{category.name}</td>
                  <td>{category.description}</td>
                  <td>
                    {category.parent_id
                      ? categories.find(
                          (c) => c.category_id === category.parent_id
                        )?.name
                      : "Không có"}
                  </td>
                  <td>{category.created_at}</td>
                  <td>
                    <Link
                      to={`/admin/categories/edit/${category.category_id}`}
                      className="btn btn-sm btn-primary me-2"
                    >
                      <i className="fa fa-edit"></i>
                    </Link>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(category.category_id)}
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Categories;
