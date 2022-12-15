import {NextFunction, Request, Response} from "express";
import Product, {ProductType} from "../models/Product";
import Validator from "../utilities/validator";

import {ObjectId} from "mongodb";

import isObjectId from "../utilities/isObjectId";


import fileUpload from "../services/fileUpload/fileUpload";
import {errorResponse, successResponse} from "../response";
import {Roles, StatusCode, TypedRequestBody} from "../types";
import {mongoConnect} from "../services/mongodb/database.service";
import Attributes from "../models/Attributes";
import {Covert} from "../dataConvert";
import ProductDescription from "../models/ProductDescription";
import {uploadImage} from "../services/cloudinary";

export const getProductCount = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        let counts = await Product.count();
        res.status(200).send(counts);
    } catch (ex) {
        errorResponse(next, "Product Count fail");
    }
};

export const getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {pageNumber = 1, perPage = 10} = req.query;
    
    const now = Date.now();
    
    try {
        
        const Collection = await Product.collection
        
        let counts = 0;
        if (pageNumber === 1) {
            counts = await Collection.countDocuments();
        }
        
        let docs = await Collection.find()
        .skip((perPage as number) * ((pageNumber as number) - 1))
        .limit(Number(perPage))
        .toArray();
        
        res.json({time: Date.now() - now, total: counts, products: docs});
        
    } catch (ex) {
        next(ex);
    }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
    if (!isObjectId(req.params.id)) {
        return res.send("please send product id");
    }
    
    try {
        let product = await Product.aggregate([
                { $match: { _id: new ObjectId(req.params.id)}},
                { $lookup: {
                    from: "product_descriptions",
                        localField: "_id",
                        foreignField: "productId",
                        as: "productDescription"
                }},
                { $unwind: { path: "$productDescription", preserveNullAndEmptyArrays: true } }
            ]
        );
       
        if(product) {
            successResponse(res, 200, product[0]);
        }
    } catch (ex) {
        next(ex);
    } finally {
    }
};


// export const getProduct = async (req, res, next)=>{
//
//   if(!isObjectId(req.params.id)){
//     return res.send('please send product id')
//   }
//
//   try {
//
//
//     let p = await collections.products.aggregate([
//       { $match: { _id: new ObjectId(req.params.id) } },
//       {
//         $lookup: {
//           from: "categories",
//           localField: "category_id",
//           foreignField: "_id",
//           as: "category"
//         }
//       },
//       {
//         $lookup: {
//           from: "brands",
//           localField: "brand_id",
//           foreignField: "_id",
//           as: "brand"
//         }
//       },
//       {
//         $lookup: {
//           from: "sellers",
//           localField: "seller_id",
//           foreignField: "_id",
//           as: "seller"
//         }
//       },
//       { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "users",
//           localField: "seller.customer_id",
//           foreignField: "_id",
//           as: "seller.seller_desc"
//         }
//       },
//       { $unwind: { path: "$seller.seller_desc", preserveNullAndEmptyArrays: true } },
//       {
//         $project: {
//           title: 1,
//           seller_id: 1,
//           seller: {
//             customer_id: 1,
//             shop_name: 1,
//             seller_info: {
//               username: 1,
//               email: 1
//             }
//           },
//           qty: 1,
//           sold: 1,
//           views: 1,
//           "category_id": 1,
//           "price": 1,
//           "brand_id": 1,
//           "created_at": 1,
//           "attributes": 1,
//           "cover_photo": 1,
//           "discount": 10,
//           "images": 1,
//           "updated_at": 1
//         }
//       }
//     ])
//
//
//     // const { c: ProductCollection, client: cc} = await dbConnect("products")
//     // client = cc
//     //
//     // let cursor =  ProductCollection.aggregate([
//     //   { $match: { _id: new ObjectId(req.params.id) } },
//     //   {
//     //     $lookup: {
//     //       from: "categories",
//     //       localField: "category_id",
//     //       foreignField: "_id",
//     //       as: "category"
//     //     }
//     //   },
//     //   {
//     //     $lookup: {
//     //       from: "brands",
//     //       localField: "brand_id",
//     //       foreignField: "_id",
//     //       as: "brand"
//     //     }
//     //   },
//     //   {
//     //     $lookup: {
//     //       from: "sellers",
//     //       localField: "seller_id",
//     //       foreignField: "_id",
//     //       as: "seller"
//     //     }
//     //   },
//     //   { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },
//     //   {
//     //     $lookup: {
//     //       from: "users",
//     //       localField: "seller.customer_id",
//     //       foreignField: "_id",
//     //       as: "seller.seller_desc"
//     //     }
//     //   },
//     //   { $unwind: { path: "$seller.seller_desc", preserveNullAndEmptyArrays: true } },
//     //   {
//     //     $project: {
//     //       title: 1,
//     //       seller_id: 1,
//     //       seller: {
//     //         customer_id: 1,
//     //         shop_name: 1,
//     //         seller_info: {
//     //           username: 1,
//     //           email: 1
//     //         }
//     //       },
//     //       qty: 1,
//     //       sold: 1,
//     //       views: 1,
//     //       "category_id": 1,
//     //       "price": 1,
//     //       "brand_id": 1,
//     //       "created_at": 1,
//     //       "attributes": 1,
//     //       "cover_photo": 1,
//     //       "discount": 10,
//     //       "images": 1,
//     //       "updated_at": 1
//     //     }
//     //   }
//     // ])
//     //
//     // let product = {}
//     //
//     // await cursor.forEach(p=>{
//     //   product = p
//     // })
//     //
//     // if(product){
//     //   return res.json({product: product})
//     //
//     // } else {
//     //   res.status(404).json({message: "Product Not Found"})
//     // }
//
//     return res.json({product: p[0]})
//
//   } catch (ex){
//     console.log("-================");
//     next(ex)
//   } finally {
//     // client?.close()
//   }
//
// }

// export const productUpdateForAttributeChange = async (req: Request, res: Response, next: NextFunction) => {
// 	const { id } = req.params;
// 	const { type, quantity } = req.body;
// 	let client;
// 	try {
// 		const { c: ProductCollection, client: cc } = await dbConnect("products");
// 		client = cc;
// 		let response;
// 		if (type === "product_view_increase") {
// 			response = await ProductCollection.findOneAndUpdate(
// 				{ _id: new ObjectId(id) },
// 				{ $inc: { views: 1 } }
// 				// { returnDocument: true}
// 			);
// 		} else if (type === "product_stock_increase") {
// 			response = await ProductCollection.findOneAndUpdate(
// 				{ _id: new ObjectId(id) },
// 				{ $inc: { qty: quantity ? Number(quantity) : 1 } }
// 				// { returnNewDocument: true}
// 			);
// 		} else if (type === "product_stock_decrease") {
// 			response = await ProductCollection.findOneAndUpdate(
// 				{ _id: new ObjectId(id) },
// 				{ $inc: { qty: quantity ? Number(quantity) : -1 } }
// 				// { returnNewDocument: true}
// 			);
// 		}
//
// 		res.status(201).json({ product: response.value });
// 	} catch (ex) {
// 		next(ex);
// 	} finally {
// 		client?.close();
// 	}
// };

export const updateProductPutReq = async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    
    try {
        
        // fileUploadHandler(req, "src/static/upload", "image", async (err, ctx)=>{
        //   if(err){
        //     throw new Error(err.message)
        //   }
        //
        //
        //   let uploadedImages: string[] = []
        //
        //   if(ctx?.files?.image){
        //     for (let i = 0; i < ctx.files.image.length; i++) {
        //       const link = ctx.files.image[i];
        //       uploadedImages.push(link.path)
        //     }
        //   }
        //
        //
        //   let { images, removePhoto, cover_photo, details, highlight,  seller_rules, description, attributes, ...other } = ctx.fields
        //
        //   let updatedProduct : ProductType = {
        //     title: other.title,
        //     price: Number(other.price),
        //     qty: Number(other.qty),
        //     sold: Number(other.sold),
        //     views: Number(other.views),
        //     discount: Number(other.discount),
        //     cover_photo: "",
        //     category_id: new ObjectId(other.category_id),
        //     brand_id: new ObjectId(other.brand_id),
        //     updated_at: new Date(),
        //     seller_id: new ObjectId(other.seller_id),
        //     images: []
        //   }
        //   if(attributes){
        //     updatedProduct.attributes = JSON.parse(attributes)
        //   }
        //
        //   if(images && typeof images === "string"){
        //     uploadedImages.push(...JSON.parse(images))
        //   }
        //
        //   if(cover_photo) {
        //     // if not cover photo an blob image name.......
        //     if (cover_photo.indexOf("/") !== -1) {
        //       updatedProduct.cover_photo = cover_photo
        //     } else {
        //       // if cover photo an blob image name. now search upload photo with blob name and make it as a cover photo
        //       uploadedImages.forEach(i => {
        //         if (i.indexOf(cover_photo) !== -1) {
        //           updatedProduct.cover_photo = i
        //         }
        //       })
        //     }
        //   } else {
        //     updatedProduct.cover_photo = uploadedImages[0]
        //   }
        //
        //   updatedProduct.images = uploadedImages
        //
        //   let doc = await ProductCollection.findOneAndUpdate({
        //     _id: new ObjectId(id)
        //   }, {
        //     // @ts-ignore
        //     $set: updatedProduct
        //   })
        //
        //   let updated: ProductDescriptionType = {
        //     description: description,
        //     updated_at: new Date()
        //   }
        //
        //   if(highlight && typeof highlight === "string" && highlight !== "{}"){
        //     updated.highlight =  JSON.parse(highlight)
        //   }
        //   if(seller_rules && typeof seller_rules === "string" && seller_rules !== "{}"){
        //     updated.seller_rules = JSON.parse(seller_rules)
        //   }
        //
        //   if(details && typeof details === "string"){
        //     updated.details = JSON.parse(details)
        //   }
        //
        //
        //   let doc2: any = await ProductDescriptionCollection.updateOne(
        //     { product_id: new ObjectId(id) },
        //     { $set: updated }
        //   )
        //
        //   if(doc2.modifiedCount === 0){
        //     let {_id, ...otherUpdated} = updated
        //     doc2 = await ProductDescriptionCollection.insertOne({
        //       ...otherUpdated,
        //       updated_at: new Date(),
        //       created_at: new Date(),
        //       product_id: new ObjectId(id)
        //     })
        //   }
        //
        //   res.send(doc)
        //
        //   client?.close()
        //
        // })
    } catch (ex) {
        console.log(ex);
        next(ex);
    } finally {
        // client?.close()
    }
};

// add new product
export const saveProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    
    
    fileUpload(req, async (err, {fields, files}) => {
        try {
            if (err) return errorResponse(next, "Form data parsing error")
            
            if (!files) return errorResponse(next, "No File found")
            
            let {
                title,
                price,
                discount = 0,
                brandId,
                categoryId,
                qty = 0,
                shippingCost = 0,
                tax = 0,
                videoLink,
                sellerRules = "[]",
                highlight = "[]",
                sku,
                summary,
                productType,
                minOrder = 1,
                attributes = "{}",
                details = "{}"
            } = fields as any;
            
            const db = await mongoConnect()
            const ProductCollection = db.collection("products")
            
            let product = await ProductCollection.findOne({title: title})
            if(product) return  errorResponse(next, "Product Name already exists")
            
            product = await ProductCollection.findOne({sku: Number(sku)})
            if(product) return  errorResponse(next, "Product Sku already exists")
            
            const ProductDetailCollection = db.collection("product_descriptions")
            
            let validate = new Validator(
                {
                    title: {type: "text", required: true},
                    price: {type: "number", required: true},
                    brandId: {type: "text", required: true},
                    categoryId: {type: "text", required: true},
                    sellerId: {type: "text", required: true},
                    qty: {type: "number", required: true},
                    attributes: {type: "object", required: true},
                    coverPhoto: {
                        type: "text",
                        required: true,
                        errorMessage: "not allowed",
                    },
                },
                {abortEarly: true}
            );
            
            let errors = validate.validate({
                title,
                price: Number(price),
                brandId,
                categoryId,
                sellerId: req.authUser._id.toString(),
                qty: Number(qty),
                attributes: attributes !== "" ? JSON.parse(attributes) : {},
            });
            
            if (errors) {
                res.status(409).json({message: errors});
                return;
            }
            
            
            let newProduct: Product | null = new Product({
                productType,
                sku: Number(sku),
                title,
                price: Number(price),
                discount: Number(discount),
                brandId: new ObjectId(brandId),
                categoryId: new ObjectId(categoryId),
                sellerId: new ObjectId(req.authUser._id),
                updatedAt: new Date(),
                createdAt: new Date(),
                qty: Number(qty),
                sold: 0,
                views: 0,
                attributes: JSON.parse(attributes),
                coverPhoto: "",
                isApproved: req.authUser.roles.includes(Roles.ADMIN),
                isActive: req.authUser.roles.includes(Roles.ADMIN),
                isMall: req.authUser.roles.includes(Roles.ADMIN)
            });
            
            try{
                newProduct.attributes = JSON.parse(attributes)
            } catch (ex){}
            
            let images: string[] = []
            let promises: any[] = []

            if(files){
                for (let filesKey in files) {
                    promises.push(
                        uploadImage(files[filesKey], {dir: "dream-bazar", fieldName: filesKey, overwrite: false})
                    )
                }
            }
            
            let result = await Promise.allSettled(promises)
            let isFail = false
            for (let resultElement of result) {
                if(resultElement.status === "rejected") {
                    isFail = true
                } else {
                    if(resultElement.value.fieldName === "coverPhoto"){
                       newProduct.coverPhoto =  resultElement.value.secure_url
                    } else {
                        images.push(resultElement.value.secure_url)
                    }
                }
            }

            if(isFail){
                return  errorResponse(next, "File Upload fail")
            }
            
            newProduct = await newProduct.save<Product>()
            
            
            if (newProduct) {
                let productDescription = new ProductDescription({
                    productId: newProduct._id,
                    images: images,
                    minOrder: Number(minOrder),
                    tax: Number(tax),
                    highlight: [],
                    details: {},
                    sellerRules: [],
                    videoLink: videoLink,
                    shippingCost: Number(shippingCost),
                    summary: summary,
                })
                
                try {
                    productDescription.details = JSON.parse(details)
                } catch (ex) {
                }
                try {
                    productDescription.highlight = JSON.parse(highlight)
                } catch (ex) {
                }
                try {
                    productDescription.sellerRules = JSON.parse(sellerRules)
                } catch (ex) {
                }
                
                await ProductDetailCollection.updateOne(
                    {productId: new ObjectId(newProduct._id)},
                    {$set: productDescription},
                    {upsert: true}
                )
                
                
                successResponse(res, StatusCode.Created, {
                    message: "Product added",
                    product: newProduct,
                });
                
            } else {
                errorResponse(next, "Internal error", StatusCode.InternalServerError)
            }
            
        } catch (ex) {
            next(ex);
        }
    })
    
}


// update product for any field
export const updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {id} = req.params;
    
    
    try {
        
        fileUpload<ProductType>(req, async (err, {fields, files}) => {
    
            let {
                title,
                price,
                views,
                discount,
                brandId,
                categoryId,
                qty,
                sku,
                shippingCost,
                tax,
                isActive,
                productType,
                minOrder = 1,
                videoLink,
                sellerRules = "[]",
                highlight = "[]",
                summary,
                attributes = "{}",
                details = "{}"
            } = fields as any;
            
            if (!sku) return errorResponse(next, "Please Provide Product SKU code")
        
    
            if (err) return errorResponse(next, "Form data parsing error")
            let updateProduct: Product = new Product()
            if (title) updateProduct.title = title
            if (price) updateProduct.price = Covert.number(price)
            if (discount) updateProduct.discount = Covert.number(discount)
            if (productType) updateProduct.productType = productType
            if (views) updateProduct.views = views
            if (brandId) updateProduct.brandId = brandId
            if (categoryId) updateProduct.categoryId = categoryId
            if (qty) updateProduct.qty = Covert.number(qty)
            if (sku) updateProduct.sku = Covert.number(sku)
    
    
            try{
                // if provide valid json
                if(attributes) {
                    updateProduct.attributes = JSON.parse(attributes)
                }
            } catch (ex){}
  
            
            // only change it admin
            if (req.authUser.roles.includes(Roles.ADMIN)) {
                if (fields?.isApproved) updateProduct.isApproved = Covert.boolean(fields.isApproved)
            }
            
            if (isActive) updateProduct.isActive = Covert.boolean(isActive)
    
    
            // detail collection
            let updateProductDetail: ProductDescription = new ProductDescription()
    
            if (shippingCost) updateProductDetail.shippingCost = Covert.number(shippingCost)
            if (summary) updateProductDetail.summary = summary
            if (videoLink) updateProductDetail.videoLink = videoLink
            if (tax) updateProductDetail.tax = Covert.number(tax)
            if (minOrder) updateProductDetail.minOrder = Covert.number(minOrder)
    
            try{
                // if provide valid json
                if(details) {
                    updateProductDetail.details = JSON.parse(details)
                }
            } catch (ex){}
    
            try{
                // if provide valid json
                if(details) {
                    updateProductDetail.highlight = JSON.parse(highlight)
                }
                
            } catch (ex){}        try{
                // if provide valid json
                if(details) {
                    updateProductDetail.sellerRules = JSON.parse(sellerRules)
                }
            } catch (ex){}
            
    
            let doc = await (await Product.collection).updateOne({_id: new ObjectId(id)},
                {$set: updateProduct}
            );
            
            // if(doc.ok){
            //     (await ProductDescription.collection()).findOneAndUpdate(
            //         {productId: new ObjectId(id)},
            //         {$set: updateProductDetail},
            //         { upsert: true }
            //
            //     );
            // }
            //
            // if (true) {
            //     successResponse(res, 201, {message: "product updated", updateProduct});
            // } else {
            //     errorResponse(next, "product update fail", StatusCode.InternalServerError);
            // }
        })
    } catch (ex) {
        next(ex);
    } finally {
    }
};


// make duplicate product
export const saveProductsAsDuplicate = async (req: Request, res: Response, next: NextFunction) => {
    let client;
    
    // try{
    //   fileUploadHandler(req, "src/static/upload", "image", async (err, ctx)=> {
    //
    //     if (err) {
    //       console.log(err.message)
    //       throw new Error(err.message)
    //     }
    //
    //     let {
    //       title,
    //       price,
    //       discount,
    //       brand_id,
    //       category_id,
    //       seller_id,
    //       qty,
    //       sold,
    //       views,
    //       attributes,
    //       cover_photo,
    //       images,
    //       removePhoto
    //     } = ctx.fields
    //
    //     try {
    //
    //       let validate = new Validator({
    //         title: {type: "text", required: true},
    //         price: {type: "number", required: true},
    //         discount: {type: "number", required: true},
    //         brand_id: {type: "text", required: true},
    //         category_id: {type: "text", required: true},
    //         seller_id: {type: "text", required: true},
    //         updated_at: {type: "text", required: true},
    //         created_at: {type: "text", required: true},
    //         qty: {type: "number", required: true},
    //         sold: {type: "number", required: true},
    //         views: {type: "number", required: true},
    //         attributes: {type: "object", required: true},
    //         cover_photo: {type: "text", required: true, errorMessage: "not allowed"},
    //         image: {type: "text", required: true}
    //       }, {abortEarly: true})
    //
    //       let errors = validate.validate({
    //         title,
    //         price,
    //         discount,
    //         brand_id,
    //         category_id,
    //         seller_id,
    //         qty,
    //         sold,
    //         views,
    //         attributes: attributes && attributes !== "" ? JSON.parse(attributes) : {}
    //       })
    //
    //
    //       // if(errors){
    //       //   res.status(409).json({message: errors})
    //       //   return
    //       // }
    //
    //       let newProduct: any = {
    //         title,
    //         price: Number(price),
    //         discount: Number(discount),
    //         brand_id: new ObjectId(brand_id),
    //         category_id: new ObjectId(category_id),
    //         seller_id: new ObjectId("6165b0ecd28d389c0a4dbc57"),
    //         updated_at: new Date(),
    //         created_at: new Date(),
    //         qty: Number(qty),
    //         sold: Number(sold),
    //         views: Number(views),
    //         attributes: attributes && attributes !== "" ? JSON.parse(attributes) : {}
    //       }
    //
    //       let uploadedImages: string[] = []
    //
    //       if (ctx.files.image) {
    //         ctx.files.image.forEach(link => {
    //           uploadedImages.push(link.path)
    //         })
    //       }
    //
    //       if (images && typeof images === "string") {
    //         uploadedImages.push(...JSON.parse(images))
    //       }
    //
    //
    //       newProduct.images = uploadedImages
    //       if (cover_photo) {
    //         if (cover_photo.indexOf("/") !== -1) {
    //           newProduct.cover_photo = cover_photo
    //         } else {
    //           newProduct.images.forEach(i => {
    //             if (i.indexOf(cover_photo)) {
    //               newProduct.cover_photo = i
    //             }
    //           })
    //         }
    //       } else {
    //         newProduct.cover_photo = uploadedImages[0]
    //       }
    //
    //       let r = await Product.insertInto(newProduct)
    //       let product_id = r.insertedId
    //
    //
    //       const {
    //         description,
    //         seller_rules,
    //         highlight,
    //         details
    //       } = ctx.fields
    //
    //       let productDescriptionValidator = new Validator({
    //         description: {type: "text", required: true},
    //         seller_rules: {type: "object", required: true},
    //         highlight: {type: "object", required: false},
    //         details: {type: "object", required: false},
    //         product_id: {type: "object", required: false}
    //       })
    //
    //       let e = productDescriptionValidator.validate({
    //         description,
    //         seller_rules: JSON.parse(seller_rules),
    //         highlight: JSON.parse(highlight),
    //         details: JSON.parse(details),
    //         product_id: product_id
    //       })
    //       if (e) {
    //         return res.send("product adding fail")
    //       }
    //
    //       let des = await ProductDescription.insertInto({
    //         description,
    //         seller_rules: JSON.parse(seller_rules),
    //         highlight: JSON.parse(highlight),
    //         details: JSON.parse(details),
    //         product_id: product_id
    //       })
    //
    //       res.status(200).json({message: "Product Successfully Added"})
    //
    //     } catch (ex){
    //       await client?.close()
    //       console.log(ex)
    //       res.json({ message: ex.message + ' not save product' })
    //     } finally {
    //       await client?.close()
    //     }
    //   })
    //
    //
    //   // const {  db, client: cc} = await dbConnect()
    //   // client = cc
    //   //
    //   // const ProductCollection  = db.collection("products")
    //   // const ProductDescriptionCollection = db.collection("product_descriptions")
    //   //
    //   //
    //   //
    //   // let imagesLink = []
    //   // let cover_photo = ""
    //   //
    //   // fileUploadHandler(req, "upload", "image", async (err, ctx)=>{
    //   //   if(err){
    //   //     throw new Error(r)
    //   //   }
    //   //
    //   //
    //   //   if(ctx?.files?.image){
    //   //     for (let i = 0; i < ctx.files.image.length; i++) {
    //   //       const link = ctx.files.image[i];
    //   //       imagesLink.push(link.path)
    //   //       if(ctx?.fields?.cover_photo){
    //   //         let match = link.path.lastIndexOf(ctx.fields.cover_photo)
    //   //         if(match !== -1){
    //   //           cover_photo = link.path
    //   //         }
    //   //       }
    //   //     }
    //   //   }
    //   //
    //   //
    //   //   const { _id, details, highlight, description, attributes, ...other } = ctx.fields
    //   //
    //   //   // console.log(other);
    //   //   // console.log(details, highlight, description);
    //   //
    //   //   let newProduct = {}
    //   //   newProduct.title = other.title
    //   //   newProduct.price = Number(other.price)
    //   //   newProduct.qty = Number(other.qty)
    //   //   newProduct.sold = Number(other.sold)
    //   //   newProduct.views = Number(other.views)
    //   //   newProduct.discount = Number(other.discount)
    //   //   newProduct.images = imagesLink
    //   //   newProduct.cover_photo = cover_photo
    //   //   if(attributes && JSON.parse(attributes)){
    //   //     newProduct.attributes = JSON.parse(attributes)
    //   //   }
    //   //
    //   //   newProduct.category_id =  new ObjectId(other.category_id)
    //   //   newProduct.brand_id =  new ObjectId(other.brand_id)
    //   //   newProduct.created_at = new Date()
    //   //   newProduct.updated_at = new Date()
    //   //
    //   //
    //   //   let resposnse = await ProductCollection.insertOne(newProduct)
    //   //   if(resposnse.acknowledged){
    //   //     let respons = await ProductDescriptionCollection.insertOne({
    //   //       details: JSON.parse(details),
    //   //       highlight: JSON.parse(highlight),
    //   //       description: description,
    //   //       product_id: resposnse.insertedId
    //   //     })
    //   //
    //   //     if(respons.acknowledged){
    //   //       // let product = {...respons.ops[0] }
    //   //       console.log(respons);
    //   //     }
    //   //   }
    //
    //
    //     // if(response.insertedCount > 0){
    //
    //     //   let product = {...response.ops[0] }
    //
    //     //   let brandData = await BrandCollection.findOne(
    //     //     {_id: new ObjectId(product.brand_id)})
    //
    //     //   let categoryData = await CategoryCollection.findOne(
    //     //     {_id: new ObjectId(product.category_id)})
    //
    //     //   product = {
    //     //     ...product,
    //     //     brand: {name: brandData.name },
    //     //     category: { name: categoryData.name  }
    //     //   }
    //
    //
    //
    //     //   res.json({ product: product })
    //     // }
    //
    //
    //     // if(insertedCount > 0){
    //     //   let cta = await CategoryCollection.findOne(
    //     //     {_id: new ObjectId(cursor.ops[0].category_id)},
    //     //     {name: 1}
    //     //   )
    //     //   res.json({ products: cursor.ops })
    //     // } else{
    //     //   res.json({ message: 'not save product' })
    //     // }
    //
    //
    //   // })
    //
    // } catch(ex){
    //   console.log(ex.message)
    //   next(ex)
    // } finally {
    //   // client?.close()
    // }
};

export const fetchCategoryProducts = async (req: Request, res: Response, next: NextFunction) => {
    const {categoryId} = req.params;
    const fetchEachSectionItems = 10;
    
    let client;
};

// product filter for client Frontend Home Page
// export const productFilterHomePage = async (req: Request, res: Response, next: NextFunction) => {
// 	const { pageNumber = 1, perPage = 10, type } = req.query;
//
// 	let client;
//
// 	try {
// 		const { c: ProductCollection, client: cc } = await dbConnect("products");
// 		client = cc;
// 		// console.log(type)
// 		let cursor;
//
// 		if (type === "most-popular") {
// 			// sort by views and pick 5 to 10 frist item from database
// 			cursor = ProductCollection.aggregate([
// 				{ $sort: { views: -1 } },
// 				{ $skip: perPage * (pageNumber - 1) },
// 				{ $limit: Number(perPage) },
// 			]);
// 		} else if (type === "most-updated") {
// 			cursor = ProductCollection.aggregate([
// 				{ $sort: { created_at: -1 } },
// 				{ $skip: perPage * (pageNumber - 1) },
// 				{ $limit: Number(perPage) },
// 			]);
// 		} else if (type === "top-selling") {
// 			cursor = ProductCollection.aggregate([
// 				{ $sort: { sold: -1 } },
// 				{ $skip: perPage * (pageNumber - 1) },
// 				{ $limit: Number(perPage) },
// 			]);
// 		} else if (type === "top-views") {
// 			cursor = ProductCollection.aggregate([
// 				{ $sort: { views: -1 } },
// 				{ $skip: perPage * (pageNumber - 1) },
// 				{ $limit: Number(perPage) },
// 			]);
// 		} else if (type === "top-views-length") {
// 			cursor = ProductCollection.aggregate([
// 				{ $sort: { views: -1 } }, // sort deasce order,
// 				{ $limit: 100 }, // choose 1 to 100 item
// 				{
// 					/// count document
// 					$group: {
// 						_id: null,
// 						count: { $sum: 1 },
// 					},
// 				},
// 			]);
//
// 			let ppp = [];
// 			await cursor.forEach((p) => {
// 				ppp.push(p);
// 			});
// 			return res.send(ppp[0]);
// 		} else if (type === "top-selling-length") {
// 			cursor = ProductCollection.aggregate([
// 				{ $sort: { sold: -1 } }, // sort deasce order,
// 				{ $limit: 100 }, // choose 1 to 100 item
// 				{
// 					/// count document
// 					$group: {
// 						_id: null,
// 						count: { $sum: 1 },
// 					},
// 				},
// 			]);
//
// 			let ppp = [];
// 			await cursor.forEach((p) => {
// 				ppp.push(p);
// 			});
// 			return res.send(ppp[0]);
// 		}
//
// 		let pp = [];
// 		await cursor.forEach((p) => {
// 			pp.push(p);
// 		});
//
// 		res.json({ products: pp });
// 	} catch (ex) {
// 		console.log(ex);
// 		next(ex);
// 	} finally {
// 		client?.close();
// 	}
// };

export const productFiltersPost = async (req: Request, res: Response, next: NextFunction) => {
    const {pageNumber, perPage, type, ids} = req.body;
    
    let client;
    
};


export const productFiltersGetV2 = async (req: Request, res: Response, next: NextFunction) => {
    let client;
    
    // try {
    // 	const { c: ProductCollection, client: cc } = await dbConnect("products");
    // 	client = cc;
    //
    // 	let query = req.query;
    //
    // 	let { pagePage, perPage, ...other } = query;
    //
    // 	let cursor;
    //
    // 	if (other.sold) {
    // 		cursor = ProductCollection.aggregate([
    // 			{ $sort: { sold: Number(other.sold) } },
    // 			{ $limit: 20 },
    // 		]);
    // 	} else if (other.discount) {
    // 		cursor = ProductCollection.aggregate([
    // 			{ $sort: { discount: Number(other.discount) } },
    // 			{ $limit: 20 },
    // 		]);
    // 	} else if (other.views) {
    // 		cursor = ProductCollection.aggregate([
    // 			{ $sort: { views: Number(other.views) } },
    // 			{ $limit: 20 },
    // 		]);
    // 	} else if (other.updated_at) {
    // 		cursor = ProductCollection.aggregate([
    // 			{ $sort: { updated_at: Number(other.updated_at) } },
    // 			{ $limit: 20 },
    // 		]);
    // 	}
    // 	let p = [];
    // 	await cursor.forEach((c) => {
    // 		p.push(c);
    // 	});
    //
    // 	res.send(p);
    // } catch (ex) {
    // 	console.log(ex);
    // 	res.send([]);
    // } finally {
    // 	client?.close();
    // }
};

type ResponseData = {
    [key: string]: { values: ProductType[]; type: string };
};

export const getHomepageSectionProducts = async (
    req: Request<ResponseData>,
    res: Response,
    next: NextFunction
) => {
    // let client: any;
    
    const data: { params: string; type: string; name: string }[] = req.body.data;
    
    let result: { [key: string]: { values: Product[]; type: string } } = {};
    
    try {
        const ProductCollection = await Product.collection

        data.forEach((item, index) => {
            (async function () {
                const params = item.params;
                
                let a = params.split("=");
                let other: {
                    sold?: string;
                    discount?: string;
                    views?: string;
                } = {};
                
                if (a.length === 2) {
                    other = {[a[0]]: a[1]};
                }
                
                let products: any = [];
                
                if (other.sold) {
                    products = await ProductCollection.aggregate([
                        {$sort: {sold: Number(other.sold)}},
                        {$limit: 20},
                    ]).toArray()
                } else if (other.discount) {
                    products = await ProductCollection.aggregate([
                        {$sort: {discount: Number(other.discount)}},
                        {$limit: 20},
                    ]).toArray()
                } else if (other.views) {
                    products = await ProductCollection.aggregate([
                        {$sort: {views: Number(other.views)}},
                        {$limit: 20},
                    ]).toArray()
                }
                
                result[item.name] = {values: products, type: "products"};
                
                if (index === data.length - 1) {
                    res.json(result);
                }
            })();
        });
    } catch (ex) {
        next(ex)
    } finally {
    
    }
    
    // try{
    //   const { c: ProductCollection, client: cc } = await dbConnect("products")
    //   client = cc;
    //
    //   let query = req.query
    //
    //   let { pagePage, perPage, ...other } = query
    //
    //   let cursor;
    //
    //   if(other.sold){
    //     cursor = ProductCollection.aggregate([
    //       { $sort: { sold: Number(other.sold) } },
    //       { $limit: 20 }
    //     ])
    //   } else if(other.discount){
    //     cursor = ProductCollection.aggregate([
    //       { $sort: { discount: Number(other.discount) } },
    //       { $limit: 20 }
    //     ])
    //   } else if(other.views){
    //     cursor = ProductCollection.aggregate([
    //       { $sort: { views: Number(other.views) } },
    //       { $limit: 20 }
    //     ])
    //   } else if(other.updated_at){
    //     cursor = ProductCollection.aggregate([
    //       { $sort: { updated_at: Number(other.updated_at) } },
    //       { $limit: 20 }
    //     ])
    //   }
    //   let p = []
    //   await cursor.forEach(c=>{
    //     p.push(c)
    //   })
    //
    //
    //   res.send(p)
    //
    // } catch(ex){
    //   console.log(ex)
    //   res.send([])
    // } finally{
    //   client?.close()
    // }
};


export const productFiltersPostV2 = async (req: TypedRequestBody<{
    categoryIds?: string[],
    brandIds?: string[],
    pageNumber: number,
    perPage: number,
    sortBy: any,
    attributes: {}
}>, res: Response, next: NextFunction) => {
    
    /** example body payload
     {
        "categoryIds": ["60df5e546419f56b97610616", "60df5e546419f56b97610608"],
        "brandIds": ["60df5e546419f56b97610601"],
        "sortBy": [{"field": "created_at", "order": 1}],
        "attributes": {
            "form_factor": ["mini_itx", "df"],
            "generation": [1]
        }
    }
     */
    
    let {
        sortBy,
        categoryIds,
        brandIds,
        attributes,
        pageNumber = 1,
        perPage = 10,
    } = req.body;




    try {

        let pipe = [];


        // select attributes
        let attributesValues = {};
        if (attributes && Object.keys(attributes).length > 0) {
            for (let attr in attributes) {
                if (attributes[attr] && attributes[attr].length > 0) {
                    attributesValues[`attributes.${attr}`] = {$in: attributes[attr]};
                }
            }
        }

        let categoryIdsOBjs: ObjectId[] = []
        categoryIds?.forEach((id) => {
            categoryIdsOBjs.push(new ObjectId(id))
        })

        const db = await mongoConnect()
        let collection = db.collection("products")

        let filter = {
            $match: {
                $and: [
                    categoryIds && categoryIds.length > 0
                        ? {
                            categoryId: {$in: categoryIdsOBjs},
                        }
                        : {},
                    brandIds && brandIds.length > 0
                        ? {
                            brandId: {$in: [...brandIds]},
                        }
                        : {},
                ],
                $or: [
                    Object.keys(attributesValues).length > 0
                        ? {
                            ...attributesValues,
                        }
                        : {},
                ],
            },
        }

        let total = undefined
        if(pageNumber == 1){
            total = await collection.aggregate([
                filter,
                {$count: "totalDocuments"}
            ]).toArray();
        }

        const result = await collection.aggregate([
            filter,
            {$skip: (Number(pageNumber) - 1) * Number(perPage)},
            {$limit: Number(perPage)},
        ]).toArray();

        let totalDocument = undefined;
        if (total && total.length > 0) {
            totalDocument = total[0].totalDocuments
        }

        successResponse(res, 200, {products: result, totalItems: totalDocument})
        
    } catch (ex) {
        next(ex)
    }
    
    // try {
    // 	const { db, client: cc } = await dbConnect();
    // 	client = cc;
    //
    // 	const ProductCollection = db.collection("products");
    // 	const CategoryCollection = db.collection("categories");
    //
    // 	let pipe = [];
    // 	let productIds = [];
    // 	// let idealForIds = []
    //
    // 	if (product_ids && product_ids) {
    // 		product_ids.forEach((id) => {
    // 			productIds.push(new ObjectId(id));
    // 		});
    // 	}
    //
    // 	let attributesValues = {};
    // 	if (attributes && Object.keys(attributes).length > 0) {
    // 		for (let attr in attributes) {
    // 			if (attributes[attr] && attributes[attr].length > 0) {
    // 				attributesValues[`attributes.${attr}`] = { $in: attributes[attr] };
    // 			}
    // 		}
    // 	}
    //
    // 	// console.log(req.body)
    // 	// { $match: { "attributes.form_factor": { $in: ["mini_itx"]  }} }
    // 	// categoryIds && categoryIds.length > 0 ? category_id: { $in: [...categoryIds] } } : [{}]
    //
    // 	pipe = [
    // 		...pipe,
    // 		{ $match: productIds.length > 0 ? { _id: { $in: productIds } } : {} },
    // 		// {$match: categoryId ? { category_id: categoryId} : {}},
    // 		{
    // 			$match: {
    // 				$and: [
    // 					categoryIds && categoryIds.length > 0
    // 						? {
    // 								category_id: { $in: [...categoryIds] },
    // 						  }
    // 						: {},
    // 					brandIds && brandIds.length > 0
    // 						? {
    // 								brand_id: { $in: [...brandIds] },
    // 						  }
    // 						: {},
    // 				],
    // 				$or: [
    // 					Object.keys(attributesValues).length > 0
    // 						? {
    // 								...attributesValues,
    // 						  }
    // 						: {},
    // 				],
    // 			},
    // 		},
    // 	];
    //
    // 	if (count) {
    // 		pipe = [
    // 			...pipe,
    // 			{
    // 				$group: {
    // 					_id: null,
    // 					total: { $sum: 1 },
    // 				},
    // 			},
    // 		];
    // 	}
    //
    // 	let sortingStage = { $sort: {} };
    // 	let sortBy = {};
    // 	if (sort_by && sort_by.length > 0) {
    // 		sort_by.map((sort) => {
    // 			sortingStage["$sort"][sort.field] = sort.order;
    // 		});
    // 		pipe = [...pipe, { ...sortingStage }];
    // 	}
    //
    // 	// {                                                                                           attributes: {
    // 	//   generation: [ 9, 1 ],                                                                     processor_type: [ 'intel' ],
    // 	//   form_factor: [ 'mini_itx' ]                                                             },
    // 	// category_ids: [ '60df5e546419f56b97610608' ]                                            }
    //
    // 	// [
    // 	//     {
    // 	//       $match: {
    // 	//         $or: [
    // 	//             {"attributes.generation": {$in: [ 9, 1 ]} } ,
    // 	//             {"attributes.form_factor": {$in: [ 'mini_itx' ]}},
    // 	//           ],
    // 	//         "category_id": {$in: [ new ObjectId("60df5e546419f56b97610608") ]}
    // 	//       }
    // 	//     }
    // 	//   ]
    //
    // 	//let cursor = ProductCollection.aggregate(pipe)
    //
    // 	// console.log(categoryIds)
    //
    // 	// let categories = await getNestedCategoryIds(req, res)
    // 	let products = await collections.products
    // 		.aggregate([
    // 			// ...pipe,
    // 			{
    // 				$match: {
    // 					categoryId: { $in: categoryIds }, // category id
    // 				},
    // 			},
    //
    // 			// { $skip: perPage * (pageNumber - 1) },
    // 			// { $limit: Number(perPage) },
    // 		])
    // 		.toArray();
    //
    // 	res.send({ products });
    //
    // 	// let cursor;
    // 	// if(category_id){
    // 	//   cursor = ProductCollection.aggregate([
    // 	//     ...pipe,
    // 	//     {
    // 	//       $match: {
    // 	//         category_id: { $in: [...categories]} // category id
    // 	//       }
    // 	//     },
    // 	//     { $skip: perPage * (pageNumber - 1) },
    // 	//     { $limit: Number(perPage) },
    // 	//   ])
    // 	// }
    // 	//
    // 	// let products = []
    // 	//
    // 	// if(cursor){
    // 	//   await cursor.forEach(p=>{
    // 	//     products.push(p)
    // 	//   })
    // 	//   res.send(products)
    // 	// } else {
    // 	//   console.log("hiiiiiiii");
    // 	// }
    // 	//
    //
    // 	// getNestedCategoryIds(req, res, async (categories)=>{
    //
    // 	//   if(categories.length > 0) {
    // 	//     pipe = [
    // 	//       ...pipe,
    // 	//       {
    // 	//         $match: {
    // 	//           category_id: { $in: categories } // here we got array of entry level category ids
    // 	//         }
    // 	//       }
    // 	//     ]
    // 	//   }
    //
    // 	//   let cursor = ProductCollection.aggregate([
    // 	//     ...pipe,
    // 	//     { $skip: perPage * (pageNumber - 1) },
    // 	//     { $limit: Number(perPage) },
    // 	//   ])
    //
    // 	//   // cursor = await ProductCollection.aggregate([
    // 	//   //   { $match: { category_id: { $in: categories } }}
    // 	//   // ])
    //
    // 	//   let products = []
    //
    // 	//   await cursor.forEach(p=>{
    // 	//     products.push(p)
    // 	//   })
    //
    // 	//   res.send(products)
    //
    // 	// })
    //
    // 	// ***************** if it not last level category (END) ******************
    //
    // 	// (async function (body){
    // 	//
    // 	//   const {
    // 	//     sort_by,
    // 	//     category_ids,
    // 	//     product_ids,
    // 	//     category_id,
    // 	//     brand_ids,
    // 	//     attributes,
    // 	//     pageNumber=1,
    // 	//     perPage=10,
    // 	//     documentCount
    // 	//   } = body
    // 	//
    // 	//   let client;
    // 	//
    // 	//
    // 	//   try{
    // 	//     const { db, client: cc } = await dbConnect()
    // 	//     client = cc
    // 	//     const ProductCollection = db.collection("products")
    // 	//     const CategoryCollection = db.collection("categories")
    // 	//
    // 	//     let pipe = []
    // 	//     let categoryIds = []
    // 	//     let categoryId;
    // 	//     let brandIds = []
    // 	//     let productIds = []
    // 	//     // let idealForIds = []
    // 	//
    // 	//     if(category_id){
    // 	//       categoryId = ObjectId(category_id)
    // 	//     }
    // 	//
    // 	//     if(category_ids && category_ids.length > 0){
    // 	//       category_ids.forEach(id=>{
    // 	//         categoryIds.push(ObjectId(id))
    // 	//       })
    // 	//     }
    // 	//     if(brand_ids && brand_ids.length > 0){
    // 	//       brand_ids.forEach(id=>{
    // 	//         brandIds.push(ObjectId(id))
    // 	//       })
    // 	//     }
    // 	//     if(product_ids && product_ids){
    // 	//       product_ids.forEach(id=>{
    // 	//         productIds.push(ObjectId(id))
    // 	//       })
    // 	//     }
    // 	//
    // 	//
    // 	//     let attributesValues = {}
    // 	//     if(attributes && Object.keys(attributes).length > 0 ){
    // 	//       for(let attr in attributes){
    // 	//
    // 	//         if(attributes[attr] && attributes[attr].length > 0){
    // 	//           attributesValues[`attributes.${attr}`] = { $in: attributes[attr] }
    // 	//         }
    // 	//
    // 	//       }
    // 	//     }
    // 	//
    // 	//     // console.log(req.body)
    // 	//     // { $match: { "attributes.form_factor": { $in: ["mini_itx"]  }} }
    // 	//     // categoryIds && categoryIds.length > 0 ? category_id: { $in: [...categoryIds] } } : [{}]
    // 	//
    // 	//     pipe = [
    // 	//       ...pipe,
    // 	//       {$match: productIds.length > 0 ? { _id: { $in: productIds } } : {}},
    // 	//       // {$match: categoryId ? { category_id: categoryId} : {}},
    // 	//       { $match : {
    // 	//           $and: [
    // 	//             // categoryIds && categoryIds.length > 0 ? {
    // 	//             //   category_id: { $in: [...categoryIds] }
    // 	//             // } : {},
    // 	//             brandIds && brandIds.length > 0 ? {
    // 	//               brand_id: { $in: [...brandIds] }
    // 	//             } : {}
    // 	//           ],
    // 	//           $or: [
    // 	//             Object.keys(attributesValues).length > 0 ? {
    // 	//               ...attributesValues,
    // 	//             } : {}
    // 	//           ]
    // 	//         }
    // 	//       }
    // 	//
    // 	//     ]
    // 	//     //
    // 	//     // if(count){
    // 	//     //   pipe = [
    // 	//     //     ...pipe,
    // 	//     //     { $group: {
    // 	//     //         _id: null, total: { $sum: 1 } }
    // 	//     //     }
    // 	//     //   ]
    // 	//     // }
    // 	//
    // 	//     let sortingStage = { $sort: {} }
    // 	//     let sortBy = {}
    // 	//     if(sort_by && sort_by.length > 0){
    // 	//       sort_by.map(sort=>{
    // 	//         sortingStage["$sort"][sort.field] = sort.order
    // 	//       })
    // 	//       pipe = [
    // 	//         ...pipe,
    // 	//         {...sortingStage},
    // 	//       ]
    // 	//     }
    // 	//
    // 	//     let categories = await getNestedCategoryIds(body)
    // 	//     // console.log(JSON.stringify(pipe))
    // 	//
    // 	//
    // 	//
    // 	//     if(documentCount) {
    // 	//
    // 	//
    // 	//
    // 	//
    // 	//       // client?.close()
    // 	//       // parentPort.postMessage(JSON.stringify(products));
    // 	//       // parentPort.close()
    // 	//       // process.exit(0);
    // 	//
    // 	//       let cursor  = ProductCollection.aggregate([
    // 	//         ...pipe,
    // 	//         {
    // 	//           $match: {
    // 	//             category_id: {$in: categories} // category id
    // 	//           }
    // 	//         },
    // 	//         {
    // 	//           $lookup: {
    // 	//             from: "brands",
    // 	//             localField: "brand_id",
    // 	//             foreignField: "_id",
    // 	//             as: "brand"
    // 	//           }
    // 	//         },
    // 	//         {$unwind: {path: "$brand", preserveNullAndEmptyArrays: true}},
    // 	//         { $group: {
    // 	//             _id: null, total: { $sum: 1 } }
    // 	//         }
    // 	//       ])
    // 	//       let doc = {}
    // 	//       await cursor.forEach(c=>{
    // 	//         doc =  {...c}
    // 	//       })
    // 	//       client?.close()
    // 	//       parentPort.postMessage(JSON.stringify({total: doc.total}));
    // 	//       parentPort.close()
    // 	//       process.exit(0);
    // 	//     } else {
    // 	//       let cursor  = ProductCollection.aggregate([
    // 	//         ...pipe,
    // 	//         {
    // 	//           $match: {
    // 	//             category_id: {$in: categories} // category id
    // 	//           }
    // 	//         },
    // 	//         {
    // 	//           $lookup: {
    // 	//             from: "brands",
    // 	//             localField: "brand_id",
    // 	//             foreignField: "_id",
    // 	//             as: "brand"
    // 	//           }
    // 	//         },
    // 	//         {$unwind: {path: "$brand", preserveNullAndEmptyArrays: true}},
    // 	//         {$skip: perPage * (pageNumber - 1)},
    // 	//         {$limit: Number(perPage)},
    // 	//       ])
    // 	//
    // 	//       let products = []
    // 	//       await cursor.forEach(p=>{
    // 	//         products.push(p)
    // 	//       })
    // 	//       client?.close()
    // 	//       parentPort.postMessage(JSON.stringify(products));
    // 	//       parentPort.close()
    // 	//       process.exit(0);
    // 	//     }
    // 	//
    // 	//
    // 	//   } catch(ex){
    // 	//
    // 	//   } finally{
    // 	//     client?.close()
    // 	//   }
    // 	//
    // 	// }(workerData.body))
    // } catch (ex) {
    // 	console.log(ex);
    // 	next(ex);
    // } finally {
    // 	client?.close();
    // }
};

export const productFilters = async (req: Request, res: Response, next: NextFunction) => {
    const {type, id, pageNumber = 1, perPage = 10} = req.query;
    
    let client;
    
    // try {
    // 	const { db, client: cc } = await dbConnect();
    // 	client = cc;
    //
    // 	const ProductCollection = db.collection("products");
    // 	const CategoryCollection = db.collection("categories");
    //
    // 	if (type === "category") {
    // 		// const products = ProductCollection.aggregate([
    // 		//   { $match: {} },
    // 		//   { $lookup: {
    // 		//     from: "categories",
    // 		//     localField: "category_id",
    // 		//     foreignField: "_id",
    // 		//     as: "category"
    // 		//   }},
    // 		//   { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    // 		//   { $lookup: {
    // 		//     from: "categories",
    // 		//     localField: "category.parent_id",
    // 		//     foreignField: "_id",
    // 		//     as: "category.category"
    // 		//   }},
    // 		//   { $unwind: { path: "$category.category", preserveNullAndEmptyArrays: true } },
    // 		//   { $lookup: {
    // 		//     from: "categories",
    // 		//     localField: "category.category.parent_id",
    // 		//     foreignField: "_id",
    // 		//     as: "category.category.category"
    // 		//   }},
    // 		//   { $unwind: { path: "$category.category.category", preserveNullAndEmptyArrays: true } },
    //
    // 		//   { $lookup: {
    // 		//     from: "categories",
    // 		//     localField: "category.category.category.parent_id",
    // 		//     foreignField: "_id",
    // 		//     as: "category.category.category.category"
    // 		//   }},
    // 		//   { $unwind: { path: "$category.category.category.category", preserveNullAndEmptyArrays: true } },
    // 		//   { $match: { 'category.category.category.category._id': new ObjectId(id) } },
    // 		//   {$limit: 20},
    // 		//   {$sort: {views: 1}},
    // 		//   { $project: {
    // 		//       category: 0
    // 		//     }
    // 		//   }
    // 		// ])
    //
    // 		// sort by views and pick 5 to 10 frist item from database
    //
    // 		// let category = await CategoryCollection.findOne({_id: new ObjectId(id)})
    // 		// if(!category.parent_id){
    // 		//   let c = CategoryCollection.find({parent_id: new ObjectId(id)})
    // 		//   await c.forEach(p=>{
    // 		//     console.log(p)
    // 		//   })
    // 		// }
    //
    // 		if (!isObjectId(id)) {
    // 			return res.send("please provide object id");
    // 		}
    // 		const category = await CategoryCollection.findOne({
    // 			_id: new ObjectId(id),
    // 		});
    //
    // 		if (category.is_product_level) {
    // 			const products = ProductCollection.aggregate([
    // 				{ $match: { category_id: new ObjectId(id) } },
    // 				{ $sort: { views: -1 } },
    // 				{ $skip: perPage * (pageNumber - 1) },
    // 				{ $limit: Number(perPage) },
    // 			]);
    // 			let pp = [];
    // 			await products.forEach((p) => {
    // 				pp.push(p);
    // 			});
    // 			return res.json({ products: pp, is_product_level: true });
    // 		} else {
    // 			return res.json({ products: [], is_product_level: false });
    // 		}
    // 	}
    //
    // 	res.send("not type");
    // } catch (ex) {
    // 	next(ex);
    // } finally {
    // 	client?.close();
    // }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    
    // try {
    // 	let doc = await collections.products.deleteOne({ _id: new ObjectId(id) });
    // 	if (doc.deletedCount > 0) {
    // 		// await ProductDescriptionCollection.deleteOne({product_id: new ObjectId(id)})
    // 		successResponse(res, 201, "product deleted");
    // 	} else {
    // 		errorResponse(next, "product not deleted", 422);
    // 	}
    // } catch (ex) {
    // 	next(ex);
    // }
};

// export const toggleWishList = async (req: Request, res: Response, next: NextFunction) => {
// 	const { id } = req.params;
// 	let client;
// 	const { productId } = req.body;
// 	try {
// 		const { db, client: cc } = await dbConnect();
// 		client = cc;
// 		const UsersCollection = db.collection("users");
// 		const ProductCollection = db.collection("products");
//
// 		if (req.user_id) {
// 			let user: any = await UsersCollection.findOne({
// 				_id: new ObjectId(req.user_id),
// 			});
// 			let exist = false;
// 			await user.wishlist.forEach((w) => {
// 				exist = w === productId;
// 			});
// 			// console.log(exist)
// 			let u: any = { result: { nModified: 0 } };
// 			if (!exist) {
// 				u = await UsersCollection.updateOne(
// 					{ _id: new ObjectId(req.user_id) },
// 					{ $push: { wishlist: new ObjectId(productId) } }
// 				);
// 			} else {
// 				u = await UsersCollection.updateOne(
// 					{ _id: new ObjectId(req.user_id) },
// 					{ $pull: { wishlist: new ObjectId(productId) } }
// 				);
// 			}
//
// 			if (u.result.nModified > 0) {
// 			}
//
// 			res.send(u);
// 		} else {
// 			res.status(403).send("Please login first");
// 			// send unauthorize response
// 		}
// 	} catch (ex) {
// 		next(ex);
// 	} finally {
// 		client?.close();
// 	}
// };

export const uploadHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // fileUploadHandler(req, "upload", "image", (err, r)=>{
        //
        //   if(err){
        //     throw new Error(err)
        //   }
        //
        //   let imagesLink = []
        //   let cover_photo = ""
        //
        //   if(r?.files?.image){
        //     for (let i = 0; i < r.files.image.length; i++) {
        //       const link = r.files.image[i];
        //       imagesLink.push(link.path)
        //       if(r?.fields?.cover_photo){
        //         let match = link.path.lastIndexOf(r.fields.cover_photo)
        //         if(match !== -1){
        //           cover_photo = link.path
        //         }
        //       }
        //     }
        //   }
        //
        //   console.log(r);
        //
        // })
    } catch (ex) {
        console.log(ex);
    }
};


export async function getProductAttributes(req: Request, res: Response, next: NextFunction) {
    try {
        let attributes = await Attributes.find()
        successResponse(res, StatusCode.Ok, attributes)
    } catch (ex) {
        next(ex)
    }
}

export async function addAttribute(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            attributeName,
            attributeLabel,
            isMultiple,
            options,
        } = req.body
        
        let attr: any = new Attributes({
            attributeName,
            attributeLabel,
            isMultiple,
            options,
        })
        
        attr = await attr.save()
        
        if (attr) {
            successResponse(res, StatusCode.Created, attr)
        }
    } catch (ex) {
        next(ex)
    }
}

export async function updateAttribute(req: Request, res: Response, next: NextFunction) {
    try {
        const attributeId = req.params.id
        const {
            attributeName,
            attributeLabel,
            isMultiple,
            options,
        } = req.body
        
        let updateData = {}
        
        if (attributeName) updateData["attributeName"] = attributeName
        if (attributeLabel) updateData["attributeLabel"] = attributeLabel
        if (isMultiple) updateData["isMultiple"] = isMultiple
        if (options) updateData["options"] = options
        
        let isUpdated = await Attributes.findOneAndUpdate(
            {_id: new ObjectId(attributeId)},
            {$set: updateData}
        )
        if (isUpdated) {
            successResponse(res, StatusCode.Created, updateData)
        }
    } catch (ex) {
        next(ex)
    }
}

export async function deleteAttribute(req: Request, res: Response, next: NextFunction) {
    try {
        const attributeId = req.params.id
        let isDeleted = await Attributes.deleteById(attributeId)
        if (isDeleted) {
            successResponse(res, StatusCode.Ok, isDeleted)
        }
    } catch (ex) {
        next(ex)
    }
}