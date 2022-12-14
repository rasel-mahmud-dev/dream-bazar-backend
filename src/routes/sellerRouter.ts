import {Router} from "express";
import isAuth from "../middlewares/isAuth";
import permission from "../middlewares/permission";
import {Roles} from "../types";
import {updateProduct} from "../controllers/productController";


import {createSeller, createShop, deleteSellerProduct, getSellerProducts, getSellerShop, updateShop} from "../controllers/sellerController";
// import permission from "../middlewares/permission";
// import {Roles, Scope} from "../types";
// import isAuth from "../middlewares/isAuth";


export default function (app: Router) {
    
    
    // update product for any field admin can change anything
    app.patch("/api/product/:id", isAuth(), permission([Roles.ADMIN]), updateProduct)

    // app.get("/api/seller/:sellerId", getSeller)

    // app.get("/api/auth/seller/current-auth", sellerAuthLoading)
    //
    // app.post("/api/seller/login", sellerLogin)
    
    app.post("/api/seller/create", createSeller)
    
    app.post("/api/seller/create/shop", isAuth(), permission([Roles.ADMIN, Roles.SELLER]), createShop)

    app.get("/api/seller/products", isAuth(), permission([Roles.ADMIN, Roles.SELLER]), getSellerProducts)
    
    app.delete("/api/seller/product/:productId", isAuth(), permission([Roles.ADMIN, Roles.SELLER]), deleteSellerProduct)

    app.patch("/api/seller/shop/:shopId",isAuth(), permission([Roles.SELLER, Roles.ADMIN]),  updateShop)
    app.get("/api/seller/shop", isAuth(), permission([Roles.SELLER, Roles.ADMIN]), getSellerShop)
}