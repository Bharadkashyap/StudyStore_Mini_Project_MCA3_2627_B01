# 🛒 StudyStore

### Online Stationery Shopping System

> A full-stack **MERN-based online stationery shopping platform** developed as an MCA Project at Marwadi University.

---

## 👥 Project Team

| Role                 | Name                     |
| -------------------- | ------------------------ |
| 👨‍💻 Project Member | **Kashyap Bharad**       |
| 👨‍💻 Project Member | **Dhaval Parmar**        |
| 👨‍💻 Project Member | **Chirag Pandya**        |
| 👨‍🏫 Project Guide  | **Dr. Jaypalsinh Gohil** |

**Course:** Master of Computer Applications (MCA)
**University:** Marwadi University

---

## 📌 About the Project

**StudyStore** is an online stationery shopping system developed to provide users with a convenient platform for browsing and purchasing stationery products.

The system provides features such as user registration, secure login, product browsing, search and category filtering, wishlist, shopping cart, order placement, and an administrative dashboard for managing products, users, and orders.

The application follows a full-stack **MERN architecture**, using React.js for the frontend, Node.js and Express.js for the backend, and MongoDB Atlas for database management.

---

# ✨ Key Features

### 👤 User Module

* User Registration
* User Login & Logout
* JWT-based Authentication
* Forgot Password
* Password Reset
* User Profile
* Browse Products
* Product Search
* Category Filtering
* Product Details
* Add to Wishlist
* Shopping Cart
* Place Orders
* View Orders

### 🛒 Shopping Module

* Product Listing
* Product Categories
* Product Search
* Product Filtering
* Wishlist Management
* Cart Management
* Order Placement
* Order Details

### 🔐 Security

* JWT Authentication
* Password Hashing using `bcryptjs`
* Protected Routes
* Role-based Access
* Secure Password Reset
* Environment Variables for Sensitive Information

### 👨‍💼 Admin Module

* Admin Dashboard
* Manage Products
* Manage Categories
* Manage Users
* Manage Orders
* Add Products
* Update Products
* Delete Products

---

# 🛠️ Technology Stack

| Category          | Technology           |
| ----------------- | -------------------- |
| Frontend          | React.js             |
| Build Tool        | Vite                 |
| Backend           | Node.js              |
| Server Framework  | Express.js           |
| Database          | MongoDB Atlas        |
| Authentication    | JSON Web Token (JWT) |
| Password Security | bcryptjs             |
| Email Service     | Nodemailer           |
| API               | REST API             |
| Version Control   | Git & GitHub         |

---

# 🗄️ Database

## MongoDB Atlas

**StudyStore** uses **MongoDB Atlas** as its database platform.

The database consists of **9 collections**, which are used to manage users, products, shopping activities, orders, reviews, and administrative data.

### 📊 Database Collections

| No. | Collection   | Description                                                                          |
| --: | ------------ | ------------------------------------------------------------------------------------ |
|   1 | `users`      | Stores registered user information and account details                               |
|   2 | `products`   | Stores stationery product information such as name, price, description, and category |
|   3 | `categories` | Stores product category information                                                  |
|   4 | `cart`       | Stores products added to users' shopping carts                                       |
|   5 | `wishlist`   | Stores products saved by users for later                                             |
|   6 | `orders`     | Stores customer order information                                                    |
|   7 | `orders`     | Stores individual products associated with customer orders                           |
|   8 | `reviews`    | Stores product reviews and ratings                                                   |
|   9 | `admins`     | Stores administrator-related information                                             |

### 📦 Database Export

A database export is included in this repository for project evaluation and reference.

```text
database/
├── users.json
├── products.json
├── categories.json
├── cart.json
├── wishlist.json
├── orders.json
├── orders.json
├── reviews.json
└── admins.json
```

> **Note:** The exported database files contain project data required for evaluation. MongoDB Atlas credentials and other sensitive information are not included.

---

# 🔗 Database & Application Flow

```text
                    ┌─────────────────┐
                    │     User        │
                    └────────┬────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │   React Frontend    │
                  └──────────┬──────────┘
                             │
                         REST API
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Node.js + Express   │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │    MongoDB Atlas    │
                  └─────────────────────┘
                             │
          ┌──────────┬───────┼───────┬──────────┐
          ▼          ▼       ▼       ▼          ▼
        Users     Products   Cart  Wishlist   Orders
```

---

# 📁 Project Structure

```text
StudyStore/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── package.json
│   └── ...
│
├── database/
│   ├── users.json
│   ├── products.json
│   ├── categories.json
│   ├── cart.json
│   ├── wishlist.json
│   ├── orders.json
│   ├── orders.json
│   ├── reviews.json
│   └── admins.json
│
├── documentation/
│   └── Project_Report.pdf
│
├── .gitignore
└── README.md
```

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_LINK
cd StudyStore
```

## 2. Install Backend Dependencies

```bash
cd backend
npm install
```

## 3. Configure Environment Variables

Create a `.env` file inside the backend directory.

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

> ⚠️ **Never upload the `.env` file to GitHub.**

## 4. Start the Backend

```bash
npm run dev
```

## 5. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

## 6. Start the Frontend

```bash
npm run dev
```

---

# 🗃️ Database Setup

To set up the project database:

1. Create a MongoDB Atlas database.
2. Create the required collections.
3. Import the JSON files provided in the `database/` folder.
4. Configure the MongoDB connection string in the backend `.env` file.
5. Start the backend server.
6. Start the React frontend.

---

# 📄 Project Documentation

The complete project documentation is included in the repository.

The documentation covers:

* Introduction
* Problem Statement
* Objectives
* Requirement Analysis
* System Design
* Module Description
* Database Design
* System Architecture
* Diagrams
* User Interface Screens
* Testing
* Results
* Conclusion
* Future Scope

---

# 🎯 Project Objectives

* To develop a user-friendly online stationery shopping platform.
* To implement secure user authentication and authorization.
* To provide efficient product searching and filtering.
* To implement wishlist and shopping cart functionality.
* To manage customer orders efficiently.
* To provide an administrative dashboard.
* To use MongoDB Atlas for database management.
* To gain practical experience in full-stack MERN development.

---

# 🔮 Future Scope

The system can be further enhanced with:

* 💳 Online Payment Gateway
* 📦 Real-time Order Tracking
* 🔔 Email and SMS Notifications
* 📊 Sales Analytics
* ⭐ Enhanced Product Reviews and Ratings

---

# 📸 Project Screenshots

Screenshots of the major modules can be added here:

* Login Page
* Registration Page
* Home Page
* Product Listing
* Product Details
* Wishlist
* Shopping Cart
* Order Page
* Admin Dashboard

---

# 👨‍🏫 Project Guidance

This project has been developed under the guidance of:

### **Dr. Jaypalsinh Gohil**

We sincerely thank our project guide for providing valuable guidance, suggestions, and support throughout the development of the project.

---

# Acknowledgement

We would like to express our sincere gratitude to **Dr. Jaypalsinh Gohil**, our project guide, for his valuable guidance and continuous support.

We also thank **Marwadi University** for providing the academic environment and resources required to complete this project.

---

## 📌 Academic Project

**StudyStore – Online Stationery Shopping System**

**MCA Mini Project | Marwadi University**

⭐ *Developed for academic and educational purposes.*
