import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import {
  getProductImage,
  useFallbackImage,
} from "../utils/productImage";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
};

function Admin() {
  /* =========================================================
     PRODUCTS
     ========================================================= */

  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* =========================================================
     USERS
     ========================================================= */

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  const [editingUser, setEditingUser] = useState(null);

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    role: "user",
  });


  

  /* =========================================================
     ORDERS
     ========================================================= */

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);



  /* =========================================================
   COUPONS
   ========================================================= */

const [coupons, setCoupons] = useState([]);
const [loadingCoupons, setLoadingCoupons] = useState(false);
const [creatingCoupon, setCreatingCoupon] = useState(false);

const [couponForm, setCouponForm] = useState({
  code: "",
  type: "percent",
  value: "",
  minOrder: "",
  maxDiscount: "",
  expiresAt: "",
  active: true,
});



  /* =========================================================
     INITIAL LOAD
     ========================================================= */

useEffect(() => {
  fetchProducts();
  fetchUsers();
  fetchOrders();
  fetchCoupons();
}, []);
  /* =========================================================
     FETCH PRODUCTS
     ========================================================= */

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");

      const productList = Array.isArray(res.data)
        ? res.data
        : res.data?.products || [];

      setProducts(productList);
    } catch (error) {
      console.error("Fetch products error:", error);

      toast.error("Products could not load");
    }
  };

  /* =========================================================
     FETCH USERS
     ========================================================= */

  const fetchUsers = async () => {
    setLoadingUsers(true);

    try {
      const res = await API.get("/users/admin/users");

      setUsers(res.data.users || []);
    } catch (error) {
      console.error("Fetch users error:", error);

      toast.error(
        error.response?.data?.message ||
          "Users could not load"
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  /* =========================================================
     FETCH ORDERS
     ========================================================= */

  const fetchOrders = async () => {
    setLoadingOrders(true);

    try {
      const res = await API.get("/orders");

      const orderList = Array.isArray(res.data)
        ? res.data
        : res.data?.orders || [];

      setOrders(orderList);
    } catch (error) {
      console.error("Fetch orders error:", error);

      toast.error(
        error.response?.data?.message ||
          "Orders could not load"
      );
    } finally {
      setLoadingOrders(false);
    }
  };

  /* =========================================================
     USER EDIT
     ========================================================= */

  const editUser = (user) => {
    setEditingUser(user);

    setUserForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      pincode: user.pincode || "",
      role: user.role || "user",
    });
  };

  /* =========================================================
     USER FORM CHANGE
     ========================================================= */

  const handleUserChange = (event) => {
    const { name, value } = event.target;

    setUserForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /* =========================================================
     UPDATE USER
     ========================================================= */

  const updateUser = async (event) => {
    event.preventDefault();

    try {
      const res = await API.put(
        `/users/admin/users/${editingUser._id}`,
        userForm
      );

      toast.success("User Updated Successfully");

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === editingUser._id
            ? res.data.user
            : user
        )
      );

      setEditingUser(null);
    } catch (error) {
      console.error("Update user error:", error);

      toast.error(
        error.response?.data?.message ||
          "User could not be updated"
      );
    }
  };

  /* =========================================================
     DELETE USER
     ========================================================= */

  const deleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await API.delete(`/users/admin/users/${id}`);

      toast.success("User Deleted Successfully");

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user._id !== id)
      );
    } catch (error) {
      console.error("Delete user error:", error);

      toast.error(
        error.response?.data?.message ||
          "User could not be deleted"
      );
    }
  };

  /* =========================================================
     FILTER USERS
     ========================================================= */

  const filteredUsers = users.filter((user) => {
    const search = userSearch.toLowerCase().trim();

    const userName = user.name?.toLowerCase() || "";
    const userEmail = user.email?.toLowerCase() || "";

    const matchesSearch =
      userName.includes(search) ||
      userEmail.includes(search);

    const matchesRole =
      userRoleFilter === "all" ||
      user.role === userRoleFilter;

    return matchesSearch && matchesRole;
  });

  /* =========================================================
     PRODUCT FORM CHANGE
     ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /* =========================================================
     IMAGE SELECTION
     ========================================================= */

  const handleImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedImage(null);
      setImagePreview("");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      event.target.value = "";

      setSelectedImage(null);
      setImagePreview("");

      toast.error(
        "Only JPG, PNG and WEBP images are allowed"
      );

      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      event.target.value = "";

      setSelectedImage(null);
      setImagePreview("");

      toast.error(
        "Image must be smaller than 2 MB"
      );

      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(file);
    setImagePreview(
      URL.createObjectURL(file)
    );
  };

  /* =========================================================
     ADD PRODUCT
     ========================================================= */

  const addProduct = async (event) => {
    event.preventDefault();

    if (!selectedImage) {
      toast.error("Please select a product image");
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();

      data.append("name", formData.name.trim());
      data.append(
        "description",
        formData.description.trim()
      );
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("category", formData.category);
      data.append("image", selectedImage);

      const res = await API.post(
        "/products",
        data
      );

      const newProduct = res.data.product;

      setProducts((currentProducts) => [
        newProduct,
        ...currentProducts,
      ]);

      toast.success("Product Added Successfully");

      setFormData(emptyForm);
      setSelectedImage(null);
      setImagePreview("");

      event.target.reset();
    } catch (error) {
      console.error(
        "Add product error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Product could not be added"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     DELETE PRODUCT
     ========================================================= */

  const deleteProduct = async (id) => {
    try {
      await API.delete(`/products/${id}`);

      toast.success(
        "Product Deleted Successfully"
      );

      setProducts(
        (currentProducts) =>
          currentProducts.filter(
            (product) =>
              product._id !== id
          )
      );
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Product could not be deleted"
      );
    }
  };

  /* =========================================================
     DASHBOARD COUNTS
     ========================================================= */

  const totalProducts = products.length;

  const totalUsers = users.filter(
    (user) => user.role === "user"
  ).length;

  const totalAdmins = users.filter(
    (user) => user.role === "admin"
  ).length;

  const totalStock = products.reduce(
    (total, product) =>
      total + Number(product.stock || 0),
    0
  );

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const shippedOrders = orders.filter(
    (order) => order.status === "Shipped"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;


  /* =========================================================
   FETCH COUPONS
   ========================================================= */

const fetchCoupons = async () => {
  setLoadingCoupons(true);

  try {
    const res = await API.get("/coupons");

    setCoupons(
      Array.isArray(res.data)
        ? res.data
        : []
    );
  } catch (error) {
    console.error("Fetch coupons error:", error);

    toast.error(
      error.response?.data?.message ||
        "Coupons could not load"
    );
  } finally {
    setLoadingCoupons(false);
  }
};


/* =========================================================
   COUPON FORM CHANGE
   ========================================================= */

const handleCouponChange = (event) => {
  const { name, value, type, checked } = event.target;

  setCouponForm((current) => ({
    ...current,
    [name]:
      type === "checkbox"
        ? checked
        : name === "code"
        ? value.toUpperCase()
        : value,
  }));
};


/* =========================================================
   CREATE COUPON
   ========================================================= */

const createCoupon = async (event) => {
  event.preventDefault();

  if (!couponForm.code.trim()) {
    toast.error("Enter coupon code");
    return;
  }

  if (!couponForm.value || Number(couponForm.value) <= 0) {
    toast.error("Enter a valid discount value");
    return;
  }

  if (!couponForm.expiresAt) {
    toast.error("Select coupon expiry date");
    return;
  }

  try {
    setCreatingCoupon(true);

    const res = await API.post("/coupons", {
      code: couponForm.code.trim().toUpperCase(),
      type: couponForm.type,
      value: Number(couponForm.value),
      minOrder: Number(couponForm.minOrder || 0),
      maxDiscount: Number(
        couponForm.maxDiscount || 0
      ),
      active: couponForm.active,
      expiresAt: new Date(
        couponForm.expiresAt
      ).toISOString(),
    });

    setCoupons((current) => [
      res.data,
      ...current,
    ]);

    toast.success("Coupon Created Successfully");

    setCouponForm({
      code: "",
      type: "percent",
      value: "",
      minOrder: "",
      maxDiscount: "",
      expiresAt: "",
      active: true,
    });
  } catch (error) {
    console.error("Create coupon error:", error);

    toast.error(
      error.response?.data?.message ||
        "Coupon could not be created"
    );
  } finally {
    setCreatingCoupon(false);
  }
};


/* =========================================================
   DELETE COUPON
   ========================================================= */

const deleteCoupon = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this coupon?"
  );

  if (!confirmDelete) {
    return;
  }

  try {
    await API.delete(`/coupons/${id}`);

    setCoupons((current) =>
      current.filter(
        (coupon) => coupon._id !== id
      )
    );

    toast.success("Coupon Deleted Successfully");
  } catch (error) {
    console.error("Delete coupon error:", error);

    toast.error(
      error.response?.data?.message ||
        "Coupon could not be deleted"
    );
  }
};


  /* =========================================================
     UI
     ========================================================= */

  return (
    <div className="admin-dashboard">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <section className="admin-dashboard-header">

        <div>
          <span className="admin-eyebrow">
            STUDYSTORE ADMIN
          </span>

          <h1>Admin Panel</h1>

          <p>
            Manage products, users and your
            stationery store from one place.
          </p>
        </div>

      </section>


      {/* =====================================================
          STATISTICS
          ===================================================== */}

      <section className="admin-stats-grid">

        {/* TOTAL PRODUCTS */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            📦
          </div>

          <div>
            <span>Total Products</span>
            <strong>
              {totalProducts}
            </strong>
          </div>

        </div>


        {/* TOTAL USERS */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            👥
          </div>

          <div>
            <span>Total Users</span>
            <strong>
              {totalUsers}
            </strong>
          </div>

        </div>


        {/* PENDING ORDERS */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            ⏳
          </div>

          <div>
            <span>Pending Orders</span>
            <strong>
              {loadingOrders
                ? "..."
                : pendingOrders}
            </strong>
          </div>

        </div>


        {/* SHIPPED ORDERS */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            🚚
          </div>

          <div>
            <span>Shipped Orders</span>
            <strong>
              {loadingOrders
                ? "..."
                : shippedOrders}
            </strong>
          </div>

        </div>


        {/* DELIVERED ORDERS */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            ✅
          </div>

          <div>
            <span>Delivered Orders</span>
            <strong>
              {loadingOrders
                ? "..."
                : deliveredOrders}
            </strong>
          </div>

        </div>


        {/* TOTAL ORDERS */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            🛒
          </div>

          <div>
            <span>Total Orders</span>
            <strong>
              {loadingOrders
                ? "..."
                : totalOrders}
            </strong>
          </div>

        </div>


        {/* ADMINISTRATORS */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            🛡️
          </div>

          <div>
            <span>Administrators</span>
            <strong>
              {totalAdmins}
            </strong>
          </div>

        </div>


        {/* TOTAL STOCK */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            📊
          </div>

          <div>
            <span>Total Stock</span>
            <strong>
              {totalStock}
            </strong>
          </div>

        </div>

      </section>


      {/* =====================================================
          PRODUCT MANAGEMENT
          ===================================================== */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>
            <span className="admin-section-eyebrow">
              PRODUCT MANAGEMENT
            </span>

            <h2>Manage Products</h2>

            <p>
              Add new stationery products
              and manage your existing inventory.
            </p>
          </div>

        </div>


        <div className="admin-product-layout">

          {/* ADD PRODUCT */}

          <div className="admin-panel-card">

            <div className="admin-card-heading">

              <div className="admin-card-icon">
                +
              </div>

              <div>
                <h3>Add New Product</h3>

                <p>
                  Add a product to your store.
                </p>
              </div>

            </div>


            <form
              className="admin-form"
              onSubmit={addProduct}
              encType="multipart/form-data"
            >

              <div className="admin-field">

                <label>
                  Product Name
                </label>

                <input
                  required
                  name="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleChange}
                />

              </div>


              <div className="admin-field">

                <label>
                  Description
                </label>

                <textarea
                  required
                  name="description"
                  placeholder="Enter product description"
                  value={formData.description}
                  onChange={handleChange}
                />

              </div>


              <div className="admin-form-row">

                <div className="admin-field">

                  <label>
                    Price
                  </label>

                  <input
                    required
                    min="0"
                    step="0.01"
                    type="number"
                    name="price"
                    placeholder="₹ Price"
                    value={formData.price}
                    onChange={handleChange}
                  />

                </div>


                <div className="admin-field">

                  <label>
                    Stock
                  </label>

                  <input
                    required
                    min="0"
                    type="number"
                    name="stock"
                    placeholder="Stock quantity"
                    value={formData.stock}
                    onChange={handleChange}
                  />

                </div>

              </div>


              <div className="admin-field">

                <label>
                  Category
                </label>

                <select
                  required
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >

                  <option value="">
                    Select category
                  </option>

                  <option value="Stationery">
                    Stationery
                  </option>

                  <option value="Books">
                    Books
                  </option>

                  <option value="Accessories">
                    Accessories
                  </option>

                </select>

              </div>


              <label className="admin-image-upload">

                <div className="admin-upload-icon">
                  ↑
                </div>

                <div>

                  <strong>
                    Select Product Image
                  </strong>

                  <span>
                    JPG, PNG or WEBP • Max 2 MB
                  </span>

                </div>

                <input
                  required
                  type="file"
                  name="image"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImage}
                />

              </label>


              {imagePreview && (
                <div className="admin-image-preview-wrapper">

                  <img
                    className="admin-image-preview"
                    src={imagePreview}
                    alt="Product preview"
                  />

                  <span>
                    Image Preview
                  </span>

                </div>
              )}


              <button
                className="admin-primary-button"
                disabled={submitting}
                type="submit"
              >

                {submitting
                  ? "Adding Product..."
                  : "+ Add Product"}

              </button>

            </form>

          </div>


          {/* PRODUCT LIST */}

          <div className="admin-panel-card">

            <div className="admin-card-heading">

              <div className="admin-card-icon">
                📦
              </div>

              <div>
                <h3>All Products</h3>

                <p>
                  {products.length} products
                  currently available.
                </p>
              </div>

            </div>


            <div className="admin-product-list">

              {products.length === 0 ? (

                <div className="admin-empty-state">

                  <div>
                    📦
                  </div>

                  <h3>
                    No Products Found
                  </h3>

                  <p>
                    Add your first product
                    using the form.
                  </p>

                </div>

              ) : (

                products.map((product) => (

                  <div
                    className="admin-product-item"
                    key={product._id}
                  >

                    <img
                      src={getProductImage(
                        product.image
                      )}
                      alt={product.name}
                      onError={useFallbackImage}
                    />


                    <div className="admin-product-info">

                      <strong>
                        {product.name}
                      </strong>

                      <span>
                        {product.category}
                      </span>

                      <p>
                        ₹{product.price}{" "}
                        · Stock {product.stock}
                      </p>

                    </div>


                    <button
                      className="admin-delete-button"
                      type="button"
                      onClick={() =>
                        deleteProduct(
                          product._id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                ))

              )}

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          USER MANAGEMENT
          ===================================================== */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>

            <span className="admin-section-eyebrow">
              USER MANAGEMENT
            </span>

            <h2>Manage Users</h2>

            <p>
              View, search, edit and manage
              StudyStore users.
            </p>

          </div>

        </div>


        <div className="admin-panel-card admin-users-card">


          {/* USER TOOLBAR */}

          <div className="admin-users-toolbar">

            <div className="admin-user-search">

              <span>
                🔍
              </span>

              <input
                type="text"
                placeholder="Search by name or email"
                value={userSearch}
                onChange={(event) =>
                  setUserSearch(
                    event.target.value
                  )
                }
              />

            </div>


            <select
              className="admin-role-filter"
              value={userRoleFilter}
              onChange={(event) =>
                setUserRoleFilter(
                  event.target.value
                )
              }
            >

              <option value="all">
                All Roles
              </option>

              <option value="user">
                Users
              </option>

              <option value="admin">
                Admins
              </option>

            </select>

          </div>


          {/* USER COUNT */}

          <div className="admin-user-results">

            Showing{" "}
            <strong>
              {filteredUsers.length}
            </strong>{" "}
            of{" "}
            <strong>
              {users.length}
            </strong>{" "}
            users

          </div>


          {/* USERS */}

          {loadingUsers ? (

            <div className="admin-loading-state">

              <div className="admin-loader"></div>

              <p>
                Loading users...
              </p>

            </div>

          ) : filteredUsers.length === 0 ? (

            <div className="admin-empty-state">

              <div>
                👥
              </div>

              <h3>
                No Users Found
              </h3>

              <p>
                Try changing your search
                or role filter.
              </p>

            </div>

          ) : (

            <div className="admin-users-list">

              {filteredUsers.map((user) => (

                <div
                  className="admin-user-item"
                  key={user._id}
                >

                  <div className="admin-user-avatar">

                    {user.name
                      ?.charAt(0)
                      .toUpperCase() || "U"}

                  </div>


                  <div className="admin-user-main">

                    <div className="admin-user-name-row">

                      <strong>
                        {user.name}
                      </strong>

                      <span
                        className={`admin-role-badge ${
                          user.role
                        }`}
                      >
                        {user.role}
                      </span>

                    </div>


                    <p>
                      {user.email}
                    </p>


                    <div className="admin-user-meta">

                      <span>
                        📅 Joined{" "}
                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>

                      {user.phone && (
                        <span>
                          📞 {user.phone}
                        </span>
                      )}

                    </div>

                  </div>


                  <div className="admin-user-actions">

                    <button
                      className="admin-edit-button"
                      type="button"
                      onClick={() =>
                        editUser(user)
                      }
                    >
                      Edit
                    </button>


                    <button
                      className="admin-delete-button"
                      type="button"
                      onClick={() =>
                        deleteUser(
                          user._id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </section>
{/* =====================================================
    COUPON MANAGEMENT
    ===================================================== */}

<section className="admin-section">

  <div className="admin-section-heading">

    <div>

      <span className="admin-section-eyebrow">
        COUPON MANAGEMENT
      </span>

      <h2>Manage Coupons</h2>

      <p>
        Create discount coupons and manage
        existing promotional offers.
      </p>

    </div>

  </div>


  <div className="admin-product-layout">

    {/* =================================================
        CREATE COUPON
        ================================================= */}

    <div className="admin-panel-card">

      <div className="admin-card-heading">

        <div className="admin-card-icon">
          %
        </div>

        <div>

          <h3>
            Create Coupon
          </h3>

          <p>
            Create a new discount coupon.
          </p>

        </div>

      </div>


      <form
        className="admin-form"
        onSubmit={createCoupon}
      >

        {/* CODE */}

        <div className="admin-field">

          <label>
            Coupon Code
          </label>

          <input
            required
            name="code"
            value={couponForm.code}
            onChange={handleCouponChange}
            placeholder="WELCOME10"
          />

        </div>


        {/* TYPE */}

        <div className="admin-field">

          <label>
            Discount Type
          </label>

          <select
            name="type"
            value={couponForm.type}
            onChange={handleCouponChange}
          >

            <option value="percent">
              Percentage
            </option>

            <option value="fixed">
              Fixed Amount
            </option>

          </select>

        </div>


        {/* VALUE */}

        <div className="admin-field">

          <label>
            Discount Value
          </label>

          <input
            required
            type="number"
            min="0"
            step="0.01"
            name="value"
            value={couponForm.value}
            onChange={handleCouponChange}
            placeholder={
              couponForm.type === "percent"
                ? "10"
                : "100"
            }
          />

        </div>


        <div className="admin-form-row">

          {/* MIN ORDER */}

          <div className="admin-field">

            <label>
              Minimum Order
            </label>

            <input
              type="number"
              min="0"
              name="minOrder"
              value={couponForm.minOrder}
              onChange={handleCouponChange}
              placeholder="0"
            />

          </div>


          {/* MAX DISCOUNT */}

          <div className="admin-field">

            <label>
              Maximum Discount
            </label>

            <input
              type="number"
              min="0"
              name="maxDiscount"
              value={couponForm.maxDiscount}
              onChange={handleCouponChange}
              placeholder="0 = unlimited"
            />

          </div>

        </div>


        {/* EXPIRY */}

        <div className="admin-field">

          <label>
            Expiry Date
          </label>

          <input
            required
            type="datetime-local"
            name="expiresAt"
            value={couponForm.expiresAt}
            onChange={handleCouponChange}
          />

        </div>


       {/* ACTIVE */}

<label className="coupon-active-toggle">

  <input
    type="checkbox"
    name="active"
    checked={couponForm.active}
    onChange={handleCouponChange}
  />

  <span className="coupon-toggle-slider"></span>

  <span className="coupon-toggle-text">
    <strong>Coupon is active</strong>
    <small>Allow customers to use this coupon</small>
  </span>

</label>


        <button
          type="submit"
          className="admin-primary-button"
          disabled={creatingCoupon}
        >

          {creatingCoupon
            ? "Creating Coupon..."
            : "+ Create Coupon"}

        </button>

      </form>

    </div>


    {/* =================================================
        COUPON LIST
        ================================================= */}

    <div className="admin-panel-card">

      <div className="admin-card-heading">

        <div className="admin-card-icon">
          🎟️
        </div>

        <div>

          <h3>
            All Coupons
          </h3>

          <p>
            {coupons.length} coupons
            available.
          </p>

        </div>

      </div>


      {loadingCoupons ? (

        <div className="admin-loading-state">

          <div className="admin-loader"></div>

          <p>
            Loading coupons...
          </p>

        </div>

      ) : coupons.length === 0 ? (

        <div className="admin-empty-state">

          <div>
            🎟️
          </div>

          <h3>
            No Coupons Found
          </h3>

          <p>
            Create your first coupon
            using the form.
          </p>

        </div>

      ) : (

        <div className="admin-product-list">

          {coupons.map((coupon) => (

            <div
              className="admin-product-item"
              key={coupon._id}
            >

              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "12px",
                  display: "grid",
                  placeItems: "center",
                  background: "#f1f5f9",
                  fontWeight: "800",
                  fontSize: "20px",
                }}
              >
                %
              </div>


              <div className="admin-product-info">

                <strong>
                  {coupon.code}
                </strong>

                <span>
                  {coupon.type === "percent"
                    ? `${coupon.value}% OFF`
                    : `₹${coupon.value} OFF`}
                </span>

                <p>

                  {coupon.minOrder > 0
                    ? `Min order ₹${coupon.minOrder}`
                    : "No minimum order"}

                  {" · "}

                  {coupon.maxDiscount > 0
                    ? `Max ₹${coupon.maxDiscount}`
                    : "No max discount"}

                </p>

                <small>

                  Expires:{" "}
                  {coupon.expiresAt
                    ? new Date(
                        coupon.expiresAt
                      ).toLocaleString()
                    : "N/A"}

                </small>

              </div>


              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  alignItems: "flex-end",
                }}
              >

                <span
                  className={`admin-role-badge ${
                    coupon.active
                      ? "admin"
                      : "user"
                  }`}
                >
                  {coupon.active
                    ? "Active"
                    : "Inactive"}
                </span>


                <button
                  type="button"
                  className="admin-delete-button"
                  onClick={() =>
                    deleteCoupon(
                      coupon._id
                    )
                  }
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  </div>

</section>




      {/* =====================================================
          EDIT USER MODAL
          ===================================================== */}

      {editingUser && (

        <div className="admin-modal-overlay">

          <div className="admin-modal">

            <div className="admin-modal-header">

              <div>

                <span className="admin-section-eyebrow">
                  USER MANAGEMENT
                </span>

                <h2>
                  Edit User
                </h2>

                <p>
                  Update user account details.
                </p>

              </div>


              <button
                type="button"
                className="admin-modal-close"
                onClick={() =>
                  setEditingUser(null)
                }
              >
                ×
              </button>

            </div>


            <form
              className="admin-edit-form"
              onSubmit={updateUser}
            >

              <div className="admin-edit-grid">

                <div className="admin-field">

                  <label>
                    Name
                  </label>

                  <input
                    name="name"
                    placeholder="Name"
                    value={userForm.name}
                    onChange={
                      handleUserChange
                    }
                    required
                  />

                </div>


                <div className="admin-field">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={userForm.email}
                    onChange={
                      handleUserChange
                    }
                    required
                  />

                </div>


                <div className="admin-field">

                  <label>
                    Phone
                  </label>

                  <input
                    name="phone"
                    placeholder="Phone"
                    value={userForm.phone}
                    onChange={
                      handleUserChange
                    }
                  />

                </div>


                <div className="admin-field">

                  <label>
                    Pincode
                  </label>

                  <input
                    name="pincode"
                    placeholder="Pincode"
                    value={userForm.pincode}
                    onChange={
                      handleUserChange
                    }
                  />

                </div>


                <div className="admin-field admin-full-field">

                  <label>
                    Address
                  </label>

                  <input
                    name="address"
                    placeholder="Address"
                    value={userForm.address}
                    onChange={
                      handleUserChange
                    }
                  />

                </div>


                <div className="admin-field">

                  <label>
                    City
                  </label>

                  <input
                    name="city"
                    placeholder="City"
                    value={userForm.city}
                    onChange={
                      handleUserChange
                    }
                  />

                </div>


                <div className="admin-field">

                  <label>
                    State
                  </label>

                  <input
                    name="state"
                    placeholder="State"
                    value={userForm.state}
                    onChange={
                      handleUserChange
                    }
                  />

                </div>


                <div className="admin-field">

                  <label>
                    Role
                  </label>

                  <select
                    name="role"
                    value={userForm.role}
                    onChange={
                      handleUserChange
                    }
                  >

                    <option value="user">
                      User
                    </option>

                    <option value="admin">
                      Admin
                    </option>

                  </select>

                </div>

              </div>


              <div className="admin-modal-actions">

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() =>
                    setEditingUser(null)
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="admin-primary-button"
                >
                  Save Changes
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Admin;