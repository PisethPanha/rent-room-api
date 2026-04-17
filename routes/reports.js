const router = require("express").Router();
const db = require("../db");

router.get("/monthly-income", async (req, res) => {
  const [rows] = await db.query(`
    SELECT month, SUM(total) as income
    FROM bills
    WHERE status='Paid'
    GROUP BY month
  `);
  res.json(rows);
});

router.get("/unpaid", async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM bills WHERE status='Unpaid'"
  );
  res.json(rows);
});

module.exports = router;
