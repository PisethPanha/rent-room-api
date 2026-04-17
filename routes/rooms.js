const router = require("express").Router();
const db = require("../db");

// GET rooms
router.get("/", async (req, res) => {
  const now = new Date()
  const CurrentMonth = now.toLocaleString("default", { month: "short" }) + " " + now.getFullYear()
  const [rows] = await db.query(" SELECT r.*, u.electric_old, u.water_old, u.electric_new, u.water_new, u.month FROM rooms r LEFT JOIN ( SELECT u1.* FROM utilities u1 INNER JOIN ( SELECT room_id, MAX(created_at) AS max_date FROM utilities GROUP BY room_id ) u2 ON u1.room_id = u2.room_id AND u1.created_at = u2.max_date ) u ON r.id = u.room_id");
  res.json(rows);
});

// ADD room
router.post("/", async (req, res) => {
  const { room_number, floor, category, monthly_rent, status } = req.body;

  await db.query(
    "INSERT INTO rooms (room_number, floor, category, monthly_rent, status) VALUES (?, ?, ?, ?, ?)",
    [room_number, floor, category, monthly_rent, status]
  );

  res.json({ message: "Room added" });
});
router.post("/update", async (req, res) => {
  const { room_number, floor, category, monthly_rent, status, id } = req.body;

  await db.query(
    "update rooms set room_number = ?, floor = ?, category = ?, monthly_rent = ?, status = ? where id = ?",
    [room_number, floor, category, monthly_rent, status, id]
  );

  res.json({ message: "Room updated" });
});
router.post("/delete", async (req, res) => {
  const { id } = req.body;

  await db.query(
    "delete from rooms where id = ?",
    [id]
  );

  res.json({ message: "Room deleted" });
});

module.exports = router;
