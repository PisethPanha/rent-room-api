const router = require("express").Router();
const db = require("../db");

router.post("/", async (req, res) => {
  const { bill_id, amount, method, date } = req.body;

  await db.query(
    "INSERT INTO payments (bill_id, paid_amount, payment_method, payment_date) VALUES (?, ?, ?, ?)",
    [bill_id, amount, method, date]
  );

  await db.query("UPDATE bills SET status='Paid' WHERE id=?", [bill_id]);

  res.json({ message: "Payment recorded" });
});

router.get("/", async (req, res) => {
  const [rows] = await db.query("select p.*, t.name, b.month from payments p left join bills b on p.bill_id = b.id left join tenants t on b.tenant_id = t.id  ")
  res.json(rows)
})

router.post("/delete", async (req, res) => {
  const {id, bill_id} = req.body
  await db.query("delete from payments where id = ?", [id])
  await db.query("UPDATE bills SET status='Unpaid' WHERE id=?", [bill_id])
  res.json({message: "payment deleted"})
})

module.exports = router;
