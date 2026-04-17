const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/rooms", require("./routes/rooms"));
app.use("/api/tenants", require("./routes/tenants"));
app.use("/api/bills", require("./routes/bills"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/utility", require("./routes/utility"));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
