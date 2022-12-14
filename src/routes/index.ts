import express from "express"

import productRouter from "./productRouter"
import categoryRouter from "./categoryRouter"
import brandRouter from "./brandRouter"
import authRouter from "./authRouter"
import shippingAddressRouter from "./shippingAddressRouter"
import orderRouter  from "./orderRouter";
import reviewRouter  from "./reviewRouter";
import uiDataRouter  from "./uiDataRouter";
import sellerRouter  from "./sellerRouter";
import filesRouter  from "./filesRouter";



const router = express.Router()


productRouter(router)
categoryRouter(router)
brandRouter(router)
authRouter(router)

sellerRouter(router)

shippingAddressRouter(router)
orderRouter(router)
reviewRouter(router)
uiDataRouter(router)

filesRouter(router)

router.get("/health", (req, res)=>{
    res.send("success")
})



export default router
