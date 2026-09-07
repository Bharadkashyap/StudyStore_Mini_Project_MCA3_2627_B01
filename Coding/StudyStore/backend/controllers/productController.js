const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");

const createProduct = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Product image is required",
      });
    }

    const productData = {
      ...req.body,
      image: `uploads/products/${req.file.filename}`,
    };

    if (productData.price) {
      productData.price = Number(productData.price);
    }

    if (productData.stock) {
      productData.stock = Number(productData.stock);
    }

    const product = await Product.create(productData);

    res.status(201).json({
      message: "Product Added Successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    if (req.file) {
      const uploadedFilePath = path.join(
        __dirname,
        "..",
        "uploads",
        "products",
        req.file.filename
      );

      if (fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product Not Found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const existingProduct = await Product.findById(
      req.params.id
    );

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product Not Found",
      });
    }

    const updateData = {
      ...req.body,
    };

   if (updateData.price !== undefined) {
  updateData.price = Number(updateData.price);
}

if (updateData.stock !== undefined) {
  updateData.stock = Number(updateData.stock);
}
    if (req.file) {
      updateData.image = `uploads/products/${req.file.filename}`;

      if (existingProduct.image) {
        const oldImagePath = path.join(
          __dirname,
          "..",
          existingProduct.image
        );

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Product Updated Successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        message: "Product Not Found",
      });
    }

    if (product.image) {
      const imagePath = path.join(
        __dirname,
        "..",
        product.image
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};