const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected ✅"))
    .catch(err => console.log(err));

// Test route
app.get("/", (req, res) => {
    res.send("API Running 🚀");
});

// Routes
const userRoutes = require("./routes/userRoutes");
const loanRoutes = require("./routes/loanRoutes");
const callbackRoutes = require("./routes/callbackRoutes");
const { getLoansByUser } = require("./controllers/loanController");

app.use("/api/user", userRoutes);
app.get("/api/loan", getLoansByUser);
app.use("/api/loan", loanRoutes);
app.use("/api/callback", callbackRoutes);

// Server
app.listen(5001, () => {
    console.log("Server running on port 5001");
});
