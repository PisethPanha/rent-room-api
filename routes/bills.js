const router = require("express").Router();
const db = require("../db");

router.post("/generate", async (req, res) => {
  const { month } = req.body;

  if (!month) {
    return res.status(400).json({ message: "Month is required" });
  }

  const [tenants] = await db.query(`
    SELECT t.*, r.monthly_rent, u.	electric_new, u.electric_old, u.water_old, u.water_new
    FROM tenants t
    JOIN rooms r ON t.room_id = r.id INNER JOIN utilities u ON r.id = u.room_id
    WHERE u.month = ?
  `, [month]);

  let created = 0;
  let skipped = 0;

  for (let t of tenants) {
    // 🔍 Check if bill already exists
    const [exists] = await db.query(
      "SELECT id FROM bills WHERE tenant_id = ? AND month = ?",
      [t.id, month]
    );

    if (exists.length > 0) {
      await db.query(
        "update bills set electric_amount = ?, water_amount = ?, total_amount = ? where tenant_id = ? and month = ?"
        ,[((t.electric_new - t.electric_old) * 0.13), ((t.water_new - t.water_old) * 0.33), (((t.electric_new - t.electric_old) * 0.13) + ((t.water_new - t.water_old) * 0.33) + Number(t.monthly_rent)), t.id, month]
      )
      skipped++;
      continue; // ⏭ skip this tenant
    }

    // ✅ Insert only if not exists
    const now = new Date().toLocaleDateString("en-CA")
    await db.query(
      `INSERT INTO bills 
      (tenant_id, month, rent_amount, electric_amount, water_amount, total_amount, status, dueDate) 
      VALUES (?, ?, ?, ?, ?, ?, 'Unpaid', DATE_ADD(?, INTERVAL 30 DAY))`,
      [t.id, month, t.monthly_rent, ((t.electric_new - t.electric_old) * 0.13), ((t.water_new - t.water_old) * 0.33), (((t.electric_new - t.electric_old) * 0.13), ((t.water_new - t.water_old) * 0.33) + Number(t.monthly_rent)), now]
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
    SELECT 
  t.name,
  r.room_number,
  b.*,
  u.electric_new,
  u.electric_old,
  u.water_old,
  u.water_new
FROM bills b
JOIN tenants t ON b.tenant_id = t.id
JOIN rooms r ON t.room_id = r.id
LEFT JOIN utilities u 
  ON r.id = u.room_id
 AND u.month = b.month
ORDER BY b.month DESC;

  `);

  res.json(rows);
});
router.post("/total_amount", async (req, res) => {
  const {month} = req.body
  const [rows] = await db.query(`
    select * from bills where month = ?
  `,[month]);
  console.log(month);
  

  res.json(rows);
});
router.get("/months", async (req, res) => {
  const [rows] = await db.query("select month, id, total_amount from bills group by month")
  res.json(rows)
})
router.post("/latest_months", async (req, res) => {
  const { lastNum } = req.body;

  const [rows] = await db.query(`
    SELECT *
    FROM bills
    WHERE status = 'Paid'
    AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
    AND created_at < DATE_SUB(CURDATE(), INTERVAL 0 MONTH)
  `, [lastNum]);

  res.json(rows);
});

router.post("/total_amonth", async (req, res) => {
  const {thisMonth, lastMonth} = req.body
  const [current] = await db.query("select SUM(total_amount) AS total_amonth from bills where status = 'Paid' and month = ?",[thisMonth])
  const [last] = await db.query("select SUM(total_amount) AS total_amonth from bills where status = 'Paid' and month = ?",[lastMonth])
  res.json({this: current, last: last})
})
router.get("/6months", async (req, res) => {
  const {thisMonth, lastMonth} = req.body
  const [rows] = await db.query(`
 SELECT 
  month,
  SUM(total_amount) AS income
FROM bills
WHERE status = 'Paid'
  AND created_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 5 MONTH)
  AND created_at <  DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
GROUP BY YEAR(created_at), MONTH(created_at)
ORDER BY YEAR(created_at), MONTH(created_at);

`);

  res.json(rows)
})

router.get("/unpaid", async (req, res) => {
  const [rows] = await db.query("select t.name, r.room_number, b.dueDate, b.total_amount, b.status from bills b inner join tenants t on b.tenant_id = t.id inner join rooms r on t.room_id = r.id where b.status = 'Unpaid' ")
  res.json(rows)
})

module.exports = router;
