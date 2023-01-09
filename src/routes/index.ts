import express from "express"

import productRouter from "./productRouter"
import categoryRouter from "./categoryRouter"
import brandRouter from "./brandRouter"
import authRouter from "./authRouter"
import shopRouter from "./shopRouter";



const router = express.Router()

router.use("/api/", productRouter)
router.use("/api/", categoryRouter)
router.use("/api", authRouter)
router.use("/api/", brandRouter)
router.use("/api/", shopRouter)


// sellerRouter(router)
// shippingAddressRouter(router)
// orderRouter(router)
// reviewRouter(router)
// uiDataRouter(router)
//
// filesRouter(router)


router.get("/health", (req, res)=>{
    res.send("success")
})



export default router
