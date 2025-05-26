import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface Category {
  category_id: number;
  name: string;
}

interface Post {
  post_id: number;
  title: string;
  content: string;
  category_id: number;
  image: string;
}

const EditPost = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<Post>({
    post_id: 0,
    title: "",
    content: "",
    category_id: 0,
    image: "",
  });
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
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

    // TODO: Gọi API lấy thông tin bài viết
    // Ví dụ:
    // fetch(`/api/admin/posts/${id}`)
    //     .then(res => res.json())
    //     .then(data => {
    //         setFormData(data);
    //         setImagePreview(data.image);
    //     });

    // Tạm thời mock dữ liệu
    setFormData({
      post_id: Number(id),
      title: "Bài viết mẫu",
      content: "<p>Nội dung bài viết mẫu</p>",
      category_id: 1,
      image: "post.jpg",
    });
    setImagePreview("post.jpg");
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditorChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      content: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file));
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
      // TODO: Gọi API cập nhật bài viết
      // Ví dụ:
      // const formDataToSend = new FormData();
      // formDataToSend.append('title', formData.title);
      // formDataToSend.append('content', formData.content);
      // formDataToSend.append('category_id', formData.category_id.toString());
      // if (newImage) {
      //     formDataToSend.append('image', newImage);
      // }
      // await fetch(`/api/admin/posts/${id}`, {
      //     method: 'PUT',
      //     body: formDataToSend
      // });

      // Tạm thời mock cập nhật bài viết
      alert("Cập nhật bài viết thành công");
      navigate("/admin/posts");
    } catch (err) {
      setError("Có lỗi xảy ra khi cập nhật bài viết");
    }
  };

  return (
    <div className="container-fluid pt-4 px-4">
      <div className="bg-light text-center rounded p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h6 className="mb-0">Sửa bài viết</h6>
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
                <ReactQuill
                  value={formData.content}
                  onChange={handleEditorChange}
                  theme="snow"
                  style={{ minHeight: 200 }}
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
                {imagePreview && (
                  <img
                    src={newImage ? imagePreview : `/upload/${imagePreview}`}
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
              Cập nhật bài viết
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
