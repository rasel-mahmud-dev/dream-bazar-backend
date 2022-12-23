import {
    deleteBrand,
    getBrand,
    getBrands,
    getBrandsCount,
    getBrandsForCategory, getBrandsInfo,
    saveBrands,
    updateBrand
} from "../controllers/brandController"
import {Router} from "express";
import isAuth from "../middlewares/isAuth";
import permission from "../middlewares/permission";
import {Roles} from "../types";


export default function (app: Router) {
    
    app.get("/api/brands/count", getBrandsCount)

    // get brands from collection
    app.get("/api/brands", getBrands)

    // get brand from collection
    app.get("/api/brand/:id", getBrand)    // get brand from collection

    app.get("/api/brands/info/:brandName", getBrandsInfo)

    // save brand in collection
    app.post("/api/brand", isAuth(), permission([Roles.ADMIN]), saveBrands)

    // get brand for category
    app.post("/api/brands/for-category", getBrandsForCategory)

    // update brand in collection
    app.patch("/api/brand/:id", isAuth(), permission([Roles.ADMIN]), updateBrand)

    app.delete("/api/brand/:id", isAuth(), permission([Roles.ADMIN]), deleteBrand)
}