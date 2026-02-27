const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const identifyRoutes = require("./routes/identify.routes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/identify", identifyRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bitespeed backend is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
