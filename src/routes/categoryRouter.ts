import {Router} from "express";

import {
    deleteCategory,
    getCategories,
    getCategoriesCount,
    getCategory,
    saveCategory,
    updateCategory
} from "../controllers/categoryController"


import permission from "../middlewares/permission";
import {Roles} from "../types";
import isAuth from "../middlewares/isAuth";


const router = Router()


// public routes
router.get("/categories/count", getCategoriesCount)

// public routes
router.get("/categories", getCategories)


// public routes
router.post("/category", isAuth(), permission([Roles.ADMIN]), saveCategory)

// admin routes
router.patch("/category/:id", isAuth(), permission([Roles.ADMIN]), updateCategory)

router.get("/category", getCategory)

router.delete("/category/:id", isAuth(), permission([Roles.ADMIN]), deleteCategory)


export default router;