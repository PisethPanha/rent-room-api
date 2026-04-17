const router = require("express").Router();
const db = require("../db");

router.post("/generate", async (req, res) => {
  const { month } = req.body;

  if (!month) {
    return res.status(400).json({ message: "Month is required" });
  }

  const [tenants] = await db.query(`
    SELECT t.id, r.monthly_rent 
    FROM tenants t
    JOIN rooms r ON t.room_id = r.id
  `);

  let created = 0;
  let skipped = 0;

  for (let t of tenants) {
    // 🔍 Check if bill already exists
    const [exists] = await db.query(
      "SELECT id FROM bills WHERE tenant_id = ? AND month = ?",
      [t.id, month]
    );

    if (exists.length > 0) {
      skipped++;
      continue; // ⏭ skip this tenant
    }

    // ✅ Insert only if not exists
    await db.query(
      `INSERT INTO bills 
      (tenant_id, month, rent_amount, electric_amount, water_amount, total_amount, status) 
      VALUES (?, ?, ?, 0, 0, ?, 'Unpaid')`,
      [t.id, month, t.monthly_rent, t.monthly_rent]
    );

    created++;
  }

  res.json({
    message: "Monthly billing process completed",
    created,
    skipped
  });
});

router.get("/", async (req, res) => {
  const [rows] = await db.query(`
    SELECT t.name, r.room_number, b.*
    FROM bills b
    JOIN tenants t ON b.tenant_id = t.id
    JOIN rooms r ON t.room_id = r.id
    ORDER BY b.month DESC
  `);

  res.json(rows);
});

module.exports = router;
