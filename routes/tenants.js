const router = require("express").Router();
const db = require("../db");

router.get("/", async (req, res) => {
  const [rows] = await db.query(`
    SELECT tenants.*, rooms.room_number 
    FROM tenants 
    JOIN rooms ON tenants.room_id = rooms.id
  `);
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { name, phone, room, deposit, checkIn, status } = req.body;

  await db.query(
    "INSERT INTO tenants (name, phone, room_id, deposit, check_in_date, status) VALUES (?, ?, ?, ?, ?, ?)",
    [name, phone, room, deposit, checkIn, status]
  );

  await db.query("UPDATE rooms SET status='Occupied' WHERE id=?", [room]);

  res.json({ message: "Tenant added" });
});
router.post("/update", async (req, res) => {
  const { name, phone, room, deposit, checkIn, status, id } = req.body;

  await db.query(
    "update tenants set name = ?, phone = ?, room_id = ?, deposit = ?, check_in_date = ?, status = ? where id = ?",
    [name, phone, room, deposit, checkIn, status, id]
  );

  res.json({ message: "Tenant updated" });
});
router.post("/delete", async (req, res) => {
  const {id } = req.body;

  await db.query(
    "delete from tenants where id = ?",
    [id]
  );

  res.json({ message: "Tenant deleted" });
});

module.exports = router;
