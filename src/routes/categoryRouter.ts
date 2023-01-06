import {Router} from "express";

import {
    addCategoryDetail,
    deleteCategory,
    deleteCategoryDetail,
    getAllCategoryDetails,
    getCategories,
    getCategoriesCount,
    getCategory,
    getCategoryDetail,
    saveCategory,
    updateCategory,
    updateCategoryDetail
} from "../controllers/categoryController"
import permission from "../middlewares/permission";
import {Roles} from "../types";
import isAuth from "../middlewares/isAuth";



export default function (app: Router) {
    
    // public routes
    app.get("/api/categories/count", getCategoriesCount)
    
    // public routes
    app.get("/api/categories", getCategories)


    // public routes
    app.post("/api/category", isAuth(), permission([Roles.ADMIN]), saveCategory)
    
    // admin routes
    app.patch("/api/category/:id", isAuth(), permission([Roles.ADMIN]),updateCategory)
    
    app.get("/api/category", getCategory)
    
    app.delete("/api/category/:id", isAuth(), permission([Roles.ADMIN]), deleteCategory)
    
    app.get("/api/category/category-details", isAuth(), permission([Roles.ADMIN]), getAllCategoryDetails)
    
    app.get("/api/category/category-detail", getCategoryDetail)
    
    app.patch("/api/category/detail/:detailId", isAuth(), permission([Roles.ADMIN, Roles.SELLER]), updateCategoryDetail)

    
    app.delete("/api/category/detail/:detailId", isAuth(), permission([Roles.ADMIN]), deleteCategoryDetail)
}