const db = require("../db")
const router = require("express").Router();

router.post("/", async (req, res) =>{
    const {id, month, elOld, elNew, wOld, wNew } = req.body

    const [exist] = await db.query("select * from utilities where room_id = ? and month = ?", [id, month])
    if (exist.length > 0){
        const [rows] = await db.query("update utilities set electric_old = ?, electric_new = ?, water_old = ?, water_new = ?, month = ? where room_id = ? and month = ?", [ elOld, elNew, wOld, wNew, id, month, month])
        return res.json({message: `utilitiy updated for room id ${id}`})
    }
    else{
        const [rows] = await db.query("insert into utilities (room_id, month, electric_old, electric_new, water_old, water_new) values (?, ?, ?, ?, ?, ?)", [id, month, elOld, elNew, wOld, wNew])
        return res.json({message: `utilitiy inserted`})
    }

})

module.exports = router
