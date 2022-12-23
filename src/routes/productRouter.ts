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


export default function (app: Router) {
    
    // app.get("/api/products/descriptions", getProductDescriptions)
    // app.delete("/api/products/descriptions/:id", deleteProductDescription)
    // app.get("/api/products/details/:productId", getProductDetail)
    
    app.get("/api/products/count", getProductCount)
    
    // use worker_threads
    // app.get("/api/products/fetch-home-page", async (req, res, next)=>{
    //   let p = await fetchHomePageSectionProducts(req.query)
    //   res.send(p)
    // })
    
    // app.get("/api/products/fetch-home-page", productFilterHomePage)
    
    app.get("/api/products/filter", productFilters)
    app.post("/api/products/filter", productFiltersPost)
    
    // delete product route, action can handle by ["ADMIN", "PRODUCT_MANAGER", "SITE_DESIGNER"]
    app.delete("/api/product/:id", deleteProduct)
    
    // this route i use worker_threads
    app.post("/api/products/filter/v2", productFiltersPostV2)

    // app.get("/api/products/filter/v2", async (req, res, next)=>{
    //   let result = await productsFilterGetReq({query: req.query, params: req.params})
    //   res.send(result)
    // })
    
    app.get("/api/products/filter/v2", productFiltersGetV2)
    
    app.post("/api/products/home-section", getHomepageSectionProducts)


    // app.patch("/api/product/:id", productUpdateForAttributeChange)
    
    
    // update product for any field admin can change anything
    app.patch("/api/product/:id", isAuth(), permission([Roles.ADMIN, Roles.SELLER]), updateProduct)
    
    app.get("/api/products/category-product/:categoryId", fetchCategoryProducts)
    
    // app.get("/api/products",  permission([Roles.ADMIN, Roles.PRODUCT_MANAGER, Roles.SITE_DESIGNER]),  getProducts)
    app.get("/api/products", getProducts)
    
    
    // add new product route
    app.post("/api/product", isAuth(), permission([Roles.ADMIN, Roles.SELLER]), saveProduct)
    
    
    app.post("/api/products/copy", saveProductsAsDuplicate)

    app.get("/api/product/:slug", getProduct)
    app.get("/api/product/detail/:productId", getProductDetail)

    app.put("/api/products/:id", updateProductPutReq)
    app.post("/api/upload", uploadHandler)
    
    
    // app.post("/api/toggle-wishlist", isAuth, productController)
    
    
    
    
    
    
    /*************************** Attribute controller ***************************/
    
    // get all product attributes for only admin
    app.get("/api/product-attributes", isAuth(), permission([Roles.ADMIN]), getProductAttributes)
    
    // update attributes for only admin
    app.patch("/api/product/attribute/:id", isAuth(), permission([Roles.ADMIN]), updateAttribute)
    
    
    // add attributes for only admin
    app.post("/api/product/attribute", isAuth(), permission([Roles.ADMIN]), addAttribute)
    
    // delete attributes for only admin
    app.delete("/api/product/attribute/:id", isAuth(), permission([Roles.ADMIN]), deleteAttribute)
}

