const express = require("express");
const router = express.Router();
const db = require("../db");

// GET settings
router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM settings LIMIT 1");
  res.json(rows[0]);
});

// UPDATE settings
router.put("/", async (req, res) => {
  const { electric_price, water_price, currency } = req.body;

  await db.query(
    "UPDATE settings SET electric_price=?, water_price=?, currency=? WHERE id=1",
    [electric_price, water_price, currency]
  );

  res.json({ message: "Settings updated" });
});

module.exports = router;
