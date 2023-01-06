import {
    addAttribute,
    deleteAttribute,
    deleteProduct,
    fetchCategoryProducts,
    getHomepageSectionProducts,
    getProduct,
    getProductAttributes,
    getProductCount, getProductDetail,
    getProducts,
    productFilters,
    productFiltersGetV2,
    productFiltersPost,
    productFiltersPostV2,
    saveProduct,
    saveProductsAsDuplicate,
    updateAttribute,
    updateProduct,
    updateProductPutReq,
    uploadHandler
} from "../controllers/productController"

import {Router} from "express";
import permission from "../middlewares/permission";
import {Roles} from "../types";
import isAuth from "../middlewares/isAuth";


const router = Router()

// router.get("/products/descriptions", getProductDescriptions)
// router.delete("/products/descriptions/:id", deleteProductDescription)
// router.get("/products/details/:productId", getProductDetail)

router.get("/products/count", getProductCount)

// use worker_threads
// router.get("/products/fetch-home-page", async (req, res, next)=>{
//   let p = await fetchHomePageSectionProducts(req.query)
//   res.send(p)
// })

// router.get("/products/fetch-home-page", productFilterHomePage)

router.get("/products/filter", productFilters)
router.post("/products/filter", productFiltersPost)

// delete product route, action can handle by ["ADMIN", "PRODUCT_MANAGER", "SITE_DESIGNER"]
router.delete("/product/:id", deleteProduct)

// this route i use worker_threads
router.post("/products/filter/v2", productFiltersPostV2)

// router.get("/products/filter/v2", async (req, res, next)=>{
//   let result = await productsFilterGetReq({query: req.query, params: req.params})
//   res.send(result)
// })

router.get("/products/filter/v2", productFiltersGetV2)

router.post("/products/home-section", getHomepageSectionProducts)


// router.patch("/product/:id", productUpdateForAttributeChange)


// update product for any field admin can change anything
router.patch("/product/:id", isAuth(), permission([Roles.ADMIN, Roles.SELLER]), updateProduct)

router.get("/products/category-product/:categoryId", fetchCategoryProducts)

// router.get("/products",  permission([Roles.ADMIN, Roles.PRODUCT_MANAGER, Roles.SITE_DESIGNER]),  getProducts)
router.get("/products", getProducts)


// add new product route
router.post("/product", isAuth(), permission([Roles.ADMIN, Roles.SELLER]), saveProduct)


router.post("/products/copy", saveProductsAsDuplicate)

router.get("/product/:slug", getProduct)


router.get("/product/detail/:productId", getProductDetail)

router.put("/products/:id", updateProductPutReq)
router.post("/upload", uploadHandler)


// router.post("/toggle-wishlist", isAuth, productController)


/*************************** Attribute controller ***************************/

// get all product attributes for only admin
router.get("/product-attributes", isAuth(), permission([Roles.ADMIN]), getProductAttributes)

// update attributes for only admin
router.patch("/product/attribute/:id", isAuth(), permission([Roles.ADMIN]), updateAttribute)


// add attributes for only admin
router.post("/product/attribute", isAuth(), permission([Roles.ADMIN]), addAttribute)

// delete attributes for only admin
router.delete("/product/attribute/:id", isAuth(), permission([Roles.ADMIN]), deleteAttribute)


export default router;

