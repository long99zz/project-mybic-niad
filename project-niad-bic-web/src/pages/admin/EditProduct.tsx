import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Category {
  category_id: number;
  name: string;
}

interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  sale_price: number;
  category_id: number;
  images: string[];
}

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<Product>({
    product_id: 0,
    name: "",
    description: "",
    price: 0,
    sale_price: 0,
    category_id: 0,
    images: [],
  });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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

    // TODO: Gọi API lấy thông tin sản phẩm
    // Ví dụ:
    // fetch(`/api/admin/products/${id}`)
    //     .then(res => res.json())
    //     .then(data => {
    //         setFormData(data);
    //         setImagePreviews(data.images);
    //     });

    // Tạm thời mock dữ liệu
    setFormData({
      product_id: Number(id),
      name: "iPhone 13",
      description: "Mô tả sản phẩm",
      price: 20000000,
      sale_price: 18000000,
      category_id: 1,
      images: ["iphone13.jpg", "iphone13-2.jpg"],
    });
    setImagePreviews(["iphone13.jpg", "iphone13-2.jpg"]);
  }, [id]);

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
      setNewImages((prev) => [...prev, ...files]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    if (index < formData.images.length) {
      // Xóa ảnh cũ
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Xóa ảnh mới
      const newIndex = index - formData.images.length;
      setNewImages((prev) => prev.filter((_, i) => i !== newIndex));
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.price || !formData.category_id) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      // TODO: Gọi API cập nhật sản phẩm
      // Ví dụ:
      // const formDataToSend = new FormData();
      // formDataToSend.append('name', formData.name);
      // formDataToSend.append('description', formData.description);
      // formDataToSend.append('price', formData.price.toString());
      // formDataToSend.append('sale_price', formData.sale_price.toString());
      // formDataToSend.append('category_id', formData.category_id.toString());
      // formDataToSend.append('existing_images', JSON.stringify(formData.images));
      // newImages.forEach(image => {
      //     formDataToSend.append('new_images[]', image);
      // });
      // await fetch(`/api/admin/products/${id}`, {
      //     method: 'PUT',
      //     body: formDataToSend
      // });

      // Tạm thời mock cập nhật sản phẩm
      alert("Cập nhật sản phẩm thành công");
      navigate("/admin/products");
    } catch (err) {
      setError("Có lỗi xảy ra khi cập nhật sản phẩm");
    }
  };

  return (
    <div className="container-fluid pt-4 px-4">
      <div className="bg-light text-center rounded p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h6 className="mb-0">Sửa sản phẩm</h6>
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
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="col-4 mb-2 position-relative">
                      <img
                        src={
                          index < formData.images.length
                            ? `/upload/${preview}`
                            : preview
                        }
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
              Cập nhật sản phẩm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
