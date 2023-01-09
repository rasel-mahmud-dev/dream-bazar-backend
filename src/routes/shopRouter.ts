import {Router} from "express";
import isAuth from "../middlewares/isAuth"
import permission from "../middlewares/permission";
import {Roles} from "../types";


const shopController = require("../controllers/shopController")

const router = Router()

// only admin call see all shops
router.get("/shops", isAuth(), permission([Roles.ADMIN]), shopController.createShop)

// normal user can see shop detail
router.get("/shops/shopId",  shopController.createShop)


// admin and seller can create shop
router.post("/shop/create", isAuth(), permission([Roles.ADMIN, Roles.SELLER]), shopController.createShop)


// admin and seller can create shop get their shop info
router.get("/shop-info", isAuth(), permission([Roles.ADMIN, Roles.SELLER]), shopController.getShopInfo)

export default router;

