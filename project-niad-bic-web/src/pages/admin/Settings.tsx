import React, { useState, useEffect } from "react";

interface Settings {
  site_name: string;
  site_description: string;
  site_keywords: string;
  site_logo: string;
  site_favicon: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
}

const Settings = () => {
  const [settings, setSettings] = useState<Settings>({
    site_name: "",
    site_description: "",
    site_keywords: "",
    site_logo: "",
    site_favicon: "",
    contact_email: "",
    contact_phone: "",
    contact_address: "",
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // TODO: Gọi API lấy cài đặt
    // Ví dụ:
    // fetch('/api/admin/settings')
    //     .then(res => res.json())
    //     .then(data => setSettings(data));

    // Tạm thời mock dữ liệu
    setSettings({
      site_name: "NIAD BIC",
      site_description: "Website bán hàng NIAD BIC",
      site_keywords: "NIAD BIC, bán hàng, thương mại điện tử",
      site_logo: "logo.png",
      site_favicon: "favicon.ico",
      contact_email: "contact@niadbic.com",
      contact_phone: "0123456789",
      contact_address: "123 Đường ABC, Quận XYZ, TP.HCM",
      facebook_url: "https://facebook.com/niadbic",
      twitter_url: "https://twitter.com/niadbic",
      instagram_url: "https://instagram.com/niadbic",
    });
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const name = e.target.name;
      setSettings((prev) => ({
        ...prev,
        [name]: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // TODO: Gọi API cập nhật cài đặt
      // Ví dụ:
      // const formData = new FormData();
      // Object.entries(settings).forEach(([key, value]) => {
      //     formData.append(key, value);
      // });
      // await fetch('/api/admin/settings', {
      //     method: 'PUT',
      //     body: formData
      // });

      // Tạm thời mock cập nhật cài đặt
      setSuccess("Cập nhật cài đặt thành công");
    } catch (err) {
      setError("Có lỗi xảy ra khi cập nhật cài đặt");
    }
  };

  return (
    <div className="container-fluid pt-4 px-4">
      <div className="bg-light text-center rounded p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h6 className="mb-0">Cài đặt website</h6>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group mb-3">
                <label htmlFor="site_name" className="form-label">
                  Tên website
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="site_name"
                  name="site_name"
                  value={settings.site_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="site_description" className="form-label">
                  Mô tả website
                </label>
                <textarea
                  className="form-control"
                  id="site_description"
                  name="site_description"
                  value={settings.site_description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="site_keywords" className="form-label">
                  Từ khóa
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="site_keywords"
                  name="site_keywords"
                  value={settings.site_keywords}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="site_logo" className="form-label">
                  Logo
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="site_logo"
                  name="site_logo"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {settings.site_logo && (
                  <img
                    src={settings.site_logo}
                    alt="Logo"
                    className="img-thumbnail mt-2"
                    style={{ maxWidth: "200px" }}
                  />
                )}
              </div>

              <div className="form-group mb-3">
                <label htmlFor="site_favicon" className="form-label">
                  Favicon
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="site_favicon"
                  name="site_favicon"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {settings.site_favicon && (
                  <img
                    src={settings.site_favicon}
                    alt="Favicon"
                    className="img-thumbnail mt-2"
                    style={{ maxWidth: "32px" }}
                  />
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group mb-3">
                <label htmlFor="contact_email" className="form-label">
                  Email liên hệ
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="contact_email"
                  name="contact_email"
                  value={settings.contact_email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="contact_phone" className="form-label">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="contact_phone"
                  name="contact_phone"
                  value={settings.contact_phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="contact_address" className="form-label">
                  Địa chỉ
                </label>
                <textarea
                  className="form-control"
                  id="contact_address"
                  name="contact_address"
                  value={settings.contact_address}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="facebook_url" className="form-label">
                  Facebook URL
                </label>
                <input
                  type="url"
                  className="form-control"
                  id="facebook_url"
                  name="facebook_url"
                  value={settings.facebook_url}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="twitter_url" className="form-label">
                  Twitter URL
                </label>
                <input
                  type="url"
                  className="form-control"
                  id="twitter_url"
                  name="twitter_url"
                  value={settings.twitter_url}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="instagram_url" className="form-label">
                  Instagram URL
                </label>
                <input
                  type="url"
                  className="form-control"
                  id="instagram_url"
                  name="instagram_url"
                  value={settings.instagram_url}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="text-end mt-3">
            <button type="submit" className="btn btn-custom">
              Lưu cài đặt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
