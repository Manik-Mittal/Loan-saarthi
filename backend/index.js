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
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

// Test route
app.get("/", (req, res) => {
    res.send("API running");
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
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});

server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Stop the running backend or set a different PORT.`);
        process.exit(1);
    }

    console.error(err);
    process.exit(1);
});
