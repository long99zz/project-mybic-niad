import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Custom upload adapter for CKEditor
class MyUploadAdapter {
  loader: any;

  constructor(loader: any) {
    this.loader = loader;
  }

  upload(): Promise<any> {
    return this.loader.file.then((file: File) => new Promise((resolve, reject) => {
      const data = new FormData();
      data.append('file', file);

      const token = sessionStorage.getItem('token');
      
      console.log('Uploading file:', file.name, 'Size:', file.size); // Debug log
      
      fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        body: data,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        console.log('Upload response status:', response.status); // Debug log
        return response.json();
      })
      .then(result => {
        console.log('Upload result:', result); // Debug log
        if (result.url) {
          // Đảm bảo URL có đầy đủ domain
          const fullUrl = result.url.startsWith('http') ? result.url : `${API_URL}${result.url}`;
          console.log('Full image URL:', fullUrl); // Debug log
          resolve({
            default: fullUrl
          });
        } else {
          reject(result.error || 'Upload failed');
        }
      })
      .catch(error => {
        console.error('Upload error:', error); // Debug log
        reject(error);
      });
    }));
  }

  abort(): void {
    // Implement abort functionality if needed
  }
}

interface Category {
  category_id: number;
  Name: string; // Backend trả về Name với chữ N viết hoa
}

const AddPost = () => {
  const navigate = useNavigate();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category_id: "",
    author: "",
    status: "published",
    image: null as File | null,
    imagePreview: "",
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Không thể tải danh mục");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Vui lòng chọn file ảnh hợp lệ");
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
      setError(""); // Clear any previous error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.title.trim()) {
      setError("Vui lòng nhập tiêu đề bài viết");
      return;
    }
    if (!formData.content.trim()) {
      setError("Vui lòng nhập nội dung bài viết");
      return;
    }
    if (!formData.category_id) {
      setError("Vui lòng chọn danh mục");
      return;
    }
    if (!formData.author.trim()) {
      setError("Vui lòng nhập tên tác giả");
      return;
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem("token");
      let imageUrl = "";
      
      // Upload image first if there's one
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append('file', formData.image);
        
        const uploadResponse = await axios.post(`${API_URL}/api/upload/image`, imageFormData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        
        if (uploadResponse.data?.url) {
          imageUrl = uploadResponse.data.url;
        }
      }
      
      // Create post data
      const postData = {
        title: formData.title.trim(),
        content: formData.content,
        category_id: parseInt(formData.category_id),
        author: formData.author.trim(),
        status: formData.status,
        image: imageUrl,
      };

      const response = await axios.post(`${API_URL}/api/posts`, postData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        setSuccess("Tạo bài viết thành công!");
        setTimeout(() => {
          navigate("/admin/posts");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error creating post:", error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Có lỗi xảy ra khi tạo bài viết");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Thêm bài viết mới</h1>
        <button
          onClick={() => navigate("/admin/posts")}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          ← Quay lại
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white p-6 rounded-lg shadow">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề bài viết *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tiêu đề bài viết..."
                required
              />
            </div>

            {/* Slug */}
            {/* <div className="bg-white p-6 rounded-lg shadow">
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL thân thiện) *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="slug-bai-viet"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                URL sẽ là: {window.location.origin}/posts/{formData.slug}
              </p>
            </div> */}

            {/* Content */}
            <div className="bg-white p-6 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung bài viết *
              </label>
              <div className="prose-editor border border-gray-300 rounded-lg overflow-hidden">
                {/* Toolbar container */}
                <div 
                  ref={toolbarRef}
                  className="border-b border-gray-200 p-2 bg-gray-50"
                  style={{ minHeight: '50px' }}
                ></div>
                
                {/* Editor container */}
                <div className="min-h-[500px] p-4" style={{ minHeight: '500px' }}>
                  <CKEditor
                    editor={DecoupledEditor as any}
                    data={formData.content}
                    onReady={(editor: any) => {
                      // Insert the toolbar into the toolbar container
                      if (toolbarRef.current && editor.ui.view.toolbar) {
                        // Clear any existing toolbar first
                        toolbarRef.current.innerHTML = '';
                        toolbarRef.current.appendChild(editor.ui.view.toolbar.element);
                      }
                      
                      // Configure image upload
                      editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
                        return new MyUploadAdapter(loader);
                      };
                    }}
                    onChange={(_, editor: any) => {
                      const data = editor.getData();
                      setFormData(prev => ({
                        ...prev,
                        content: data,
                      }));
                    }}
                    config={{
                      toolbar: {
                        items: [
                          'heading',
                          '|',
                          'fontSize',
                          'fontFamily',
                          'fontColor',
                          'fontBackgroundColor',
                          '|',
                          'bold',
                          'italic',
                          'underline',
                          'strikethrough',
                          '|',
                          'alignment',
                          '|',
                          'numberedList',
                          'bulletedList',
                          '|',
                          'outdent',
                          'indent',
                          '|',
                          'link',
                          'blockQuote',
                          'insertTable',
                          '|',
                          'imageUpload',
                          'mediaEmbed',
                          '|',
                          'undo',
                          'redo'
                        ]
                      },
                      image: {
                        toolbar: [
                          'imageTextAlternative',
                          'imageStyle:inline',
                          'imageStyle:block',
                          'imageStyle:side',
                          '|',
                          'toggleImageCaption',
                          'imageResize'
                        ],
                        resizeOptions: [
                          {
                            name: 'imageResize:original',
                            label: 'Original',
                            value: null
                          },
                          {
                            name: 'imageResize:25',
                            label: '25%',
                            value: '25'
                          },
                          {
                            name: 'imageResize:50',
                            label: '50%',
                            value: '50'
                          },
                          {
                            name: 'imageResize:75',
                            label: '75%',
                            value: '75'
                          }
                        ]
                      },
                      table: {
                        contentToolbar: [
                          'tableColumn',
                          'tableRow',
                          'mergeTableCells'
                        ]
                      }
                    }}
                  />
                </div>
              </div>
              <style dangerouslySetInnerHTML={{
                __html: `
                  .ck-editor__editable_inline {
                    min-height: 450px !important;
                  }
                  .ck-editor__main {
                    min-height: 450px !important;
                  }
                `
              }} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt xuất bản</h3>
              
              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái *
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="draft">Nháp</option>
                    <option value="published">Xuất bản</option>
                    <option value="archived">Lưu trữ</option>
                  </select>
                </div>

                {/* Author */}
                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                    Tác giả *
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tên tác giả"
                    required
                  />
                </div>

              </div>
            </div>

            {/* Category */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Danh mục</h3>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured Image */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ảnh đại diện</h3>
              <div className="space-y-4">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.imagePreview && (
                  <div className="relative">
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: null, imagePreview: "" }))}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  Tối đa 5MB. Định dạng: JPG, PNG, GIF, WebP
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-white p-6 rounded-lg shadow">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  loading
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang tạo...
                  </div>
                ) : (
                  "Tạo bài viết"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPost;