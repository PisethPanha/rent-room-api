const router = require("express").Router();
const db = require("../db");

router.post("/", async (req, res) => {
  const { bill_id, amount, method } = req.body;

  await db.query(
    "INSERT INTO payments (bill_id, amount, method, payment_date) VALUES (?, ?, ?, NOW())",
    [bill_id, amount, method]
  );

  await db.query("UPDATE bills SET status='Paid' WHERE id=?", [bill_id]);

  res.json({ message: "Payment recorded" });
});

module.exports = router;
