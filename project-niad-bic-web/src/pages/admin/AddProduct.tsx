import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Category {
  category_id: number;
  name: string;
}

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    sale_price: "",
    category_id: "",
    images: [] as File[],
    imagePreviews: [] as string[],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    // TODO: Gọi API lấy danh sách danh mục
    // Ví dụ:
    // fetch('/api/admin/categories')
    //     .then(res => res.json())
    //     .then(data => setCategories(data));

    // Tạm thời mock dữ liệu
    setCategories([
      { category_id: 1, name: "Điện thoại" },
      { category_id: 2, name: "Laptop" },
    ]);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...files],
        imagePreviews: [...prev.imagePreviews, ...newPreviews],
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.price || !formData.category_id) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      // TODO: Gọi API thêm sản phẩm
      // Ví dụ:
      // const formDataToSend = new FormData();
      // formDataToSend.append('name', formData.name);
      // formDataToSend.append('description', formData.description);
      // formDataToSend.append('price', formData.price);
      // formDataToSend.append('sale_price', formData.sale_price);
      // formDataToSend.append('category_id', formData.category_id);
      // formData.images.forEach(image => {
      //     formDataToSend.append('images[]', image);
      // });
      // await fetch('/api/admin/products', {
      //     method: 'POST',
      //     body: formDataToSend
      // });

      // Tạm thời mock thêm sản phẩm
      alert("Thêm sản phẩm thành công");
      navigate("/admin/products");
    } catch (err) {
      setError("Có lỗi xảy ra khi thêm sản phẩm");
    }
  };

  return (
    <div className="container-fluid pt-4 px-4">
      <div className="bg-light text-center rounded p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h6 className="mb-0">Thêm sản phẩm mới</h6>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-8">
              <div className="form-group mb-3">
                <label htmlFor="name" className="form-label">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="description" className="form-label">
                  Mô tả
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label htmlFor="price" className="form-label">
                      Giá thường *
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label htmlFor="sale_price" className="form-label">
                      Giá khuyến mãi
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="sale_price"
                      name="sale_price"
                      value={formData.sale_price}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="form-group mb-3">
                <label htmlFor="category_id" className="form-label">
                  Danh mục *
                </label>
                <select
                  className="form-select"
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-3">
                <label htmlFor="images" className="form-label">
                  Hình ảnh sản phẩm
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
                <div className="row mt-2">
                  {formData.imagePreviews.map((preview, index) => (
                    <div key={index} className="col-4 mb-2 position-relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="img-thumbnail"
                        style={{
                          width: "100%",
                          height: "100px",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm position-absolute top-0 end-0"
                        onClick={() => removeImage(index)}
                      >
                        <i className="fa fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="text-end mt-3">
            <button type="submit" className="btn btn-custom">
              Thêm sản phẩm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
