const port = process.env.PORT || 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
require("dotenv").config(); // For environment variables

app.use(express.json());
app.use(
  cors({
    origin: ["https://your-render-frontend-url.onrender.com"], // Replace with your frontend's Render URL
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Database Connection with MongoDB
mongoose
  .connect(process.env.MONGO_URI) // MongoDB URI from environment variables
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log("MongoDB connection error:", error));

// API Root
app.get("/", (req, res) => {
  res.send("Express App is Running");
});

// Image storage engine
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Static and image upload endpoint
app.use("/images", express.static("upload/images"));
app.post("/upload", upload.single("product"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, message: "No file uploaded" });
  }
  res.json({
    success: 1,
    image_url: `https://your-render-backend-url.onrender.com/images/${req.file.filename}`, // Replace with backend Render URL
  });
});

// Product Schema
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
});

// Endpoints for products
app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;
  try {
    const product = new Product({
      id: id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
    });

    await product.save();
    res.json({ success: true, name: req.body.name });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to save product" });
  }
});

app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({ success: true, name: req.body.name });
});

app.get("/allproducts", async (req, res) => {
  const products = await Product.find({});
  res.send(products);
});

// User Schema
const Users = mongoose.model("Users", {
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  cartData: { type: Object },
  date: { type: Date, default: Date.now },
});

// User Signup
app.post("/signup", async (req, res) => {
  const check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({ success: false, errors: "User already exists." });
  }

  const cart = Array(300).fill(0).reduce((acc, _, idx) => ({ ...acc, [idx]: 0 }), {});
  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });

  await user.save();
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
  res.json({ success: true, token });
});

// User Login
app.post("/login", async (req, res) => {
  const user = await Users.findOne({ email: req.body.email });
  if (user && req.body.password === user.password) {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } else {
    res.json({ success: false, errors: "Invalid email or password" });
  }
});

// Middleware to fetch user
const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).send({ errors: "Authentication required" });
  }
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.id;
    next();
  } catch {
    res.status(401).send({ errors: "Invalid token" });
  }
};

// Cart Endpoints
app.post("/addtocart", fetchUser, async (req, res) => {
  const user = await Users.findById(req.user);
  user.cartData[req.body.itemId]++;
  await user.save();
  res.send("Added");
});

app.post("/removefromcart", fetchUser, async (req, res) => {
  const user = await Users.findById(req.user);
  user.cartData[req.body.itemId]--;
  await user.save();
  res.send("Removed");
});

app.post("/getcart", fetchUser, async (req, res) => {
  const user = await Users.findById(req.user);
  res.json(user.cartData);
});

// Server Start
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
