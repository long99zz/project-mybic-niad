import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

interface Category {
  category_id: number;
  name: string;
}

const AddPost = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category_id: "",
    image: null as File | null,
    imagePreview: "",
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
      { category_id: 1, name: "Tin tức" },
      { category_id: 2, name: "Khuyến mãi" },
    ]);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditorChange = (event: any, editor: any) => {
    const data = editor.getData();
    setFormData((prev) => ({
      ...prev,
      content: data,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title || !formData.content || !formData.category_id) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      // TODO: Gọi API thêm bài viết
      // Ví dụ:
      // const formDataToSend = new FormData();
      // formDataToSend.append('title', formData.title);
      // formDataToSend.append('content', formData.content);
      // formDataToSend.append('category_id', formData.category_id);
      // if (formData.image) {
      //     formDataToSend.append('image', formData.image);
      // }
      // await fetch('/api/admin/posts', {
      //     method: 'POST',
      //     body: formDataToSend
      // });

      // Tạm thời mock thêm bài viết
      alert("Thêm bài viết thành công");
      navigate("/admin/posts");
    } catch (err) {
      setError("Có lỗi xảy ra khi thêm bài viết");
    }
  };

  return (
    <div className="container-fluid pt-4 px-4">
      <div className="bg-light text-center rounded p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h6 className="mb-0">Thêm bài viết mới</h6>
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
                <label htmlFor="title" className="form-label">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="content" className="form-label">
                  Nội dung
                </label>
                <CKEditor
                  editor={ClassicEditor}
                  data={formData.content}
                  onChange={handleEditorChange}
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="form-group mb-3">
                <label htmlFor="category_id" className="form-label">
                  Chuyên mục
                </label>
                <select
                  className="form-select"
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn chuyên mục</option>
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
                <label htmlFor="image" className="form-label">
                  Ảnh đại diện
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {formData.imagePreview && (
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="img-thumbnail mt-2"
                    style={{ maxWidth: "200px" }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="text-end mt-3">
            <button type="submit" className="btn btn-custom">
              Thêm bài viết
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPost;
