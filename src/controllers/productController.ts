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
import slugify from "slugify";
import parseJson from "../utilities/parseJson";

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

    const {slug, id} = req.params;


    
    try {
        console.log(id)
        let product: unknown = {}
        if(id) {
            product = await Product.aggregate([
                    {$match: {_id: new ObjectId(id)}},
                    // { $lookup: {
                    //     from: "product_descriptions",
                    //         localField: "_id",
                    //         foreignField: "productId",
                    //         as: "productDescription"
                    // }},
                    // { $unwind: { path: "$productDescription", preserveNullAndEmptyArrays: true } }
                ]
            );
        } else {
            product = await Product.aggregate([
                    {$match: {slug: slug}},
                    // { $lookup: {
                    //     from: "product_descriptions",
                    //         localField: "_id",
                    //         foreignField: "productId",
                    //         as: "productDescription"
                    // }},
                    // { $unwind: { path: "$productDescription", preserveNullAndEmptyArrays: true } }
                ]
            );
        }
       
        if(product) {
            successResponse(res, StatusCode.Ok, product[0]);
        }
    } catch (ex) {
        next(ex);
    } finally {
    }
};

export const getProductDetail = async (req: Request, res: Response, next: NextFunction) => {

    const {productId} = req.params;



    try {


        let product = await Product.aggregate([
                { $match: { _id: new ObjectId(productId) }},
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
            successResponse(res, StatusCode.Ok, product[0]);
        }
    } catch (ex) {
        next(ex);
    } finally {
    }
};



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
                specification = "{}"
            } = fields as any;

            
            let product = await Product.findOne({ $or: [{sku: Number(sku), title: title}] })
            if(product) return  errorResponse(next, "Product Name or Sku already exists")

            
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

            let removeBadCharacter = title.replace(/["!@#.<$%^&*()>?/|}{]/g, "")

            let newProduct: Product | null = new Product({
                productType,
                sku: Number(sku),
                title,
                slug: slugify(removeBadCharacter, {lower: true, replacement: "-", locale: "en", strict: true, trim: true}),
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
                isApproved: !!req.authUser.roles.includes(Roles.ADMIN),
                isActive: !!req.authUser.roles.includes(Roles.ADMIN),
                isMall: !!req.authUser.roles.includes(Roles.ADMIN),
                storeId: new ObjectId(req.authUser.storeId),
            });



            // filter attributes
            let attributesObj = await parseJson(attributes)
            if(attributesObj) {
                newProduct.attributes = attributesObj
            }

            
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
                return errorResponse(next, "File Upload fail")
            }

            newProduct = await newProduct.save<Product>()

            if (newProduct) {
                let productDescription = new ProductDescription({
                    productId: newProduct._id,
                    images: images,
                    minOrder: Number(minOrder),
                    tax: Number(tax),
                    highlight: [],
                    specification: {},
                    sellerRules: [],
                    videoLink: videoLink,
                    shippingCost: Number(shippingCost),
                    summary: summary,
                })
                



                let highlightArray = await parseJson(highlight)
                // if provide valid json
                if(highlightArray) {
                    productDescription.highlight = highlightArray
                }


                let sellerRulesArray = await parseJson(sellerRules)
                // if provide valid json
                if(sellerRulesArray) {
                    productDescription.sellerRules = sellerRulesArray
                }


                let specificationObj = await parseJson(specification)
                // if provide valid json
                if(specificationObj) {
                    productDescription.specification = specificationObj
                }


                ProductDescription.findAndUpdate(
                    {productId: new ObjectId(newProduct._id)},
                    {$set: productDescription},
                    {upsert: true}
                ).then(()=>{

                    successResponse(res, StatusCode.Created, {
                        message: "Product added successfully",
                        product: newProduct,
                    });

                })
                    .catch(async (ex)=>{
                        if(newProduct?._id) {
                            await Product.deleteById(newProduct._id.toString())
                        }
                        next(ex);
                })
                

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

            if (err) return errorResponse(next, "Form data parsing error")

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
                summary="",
                attributes = "{}",
                specification = "{}"
            } = fields as any;


            if (!sku) return errorResponse(next, "Please Provide Product SKU code")


            let product = await Product.findOne<Product>({ $or: [{sku: Number(sku), title: title}] })
            if(!product) return  errorResponse(next, "Product not found", StatusCode.NotFound)


            if (err) return errorResponse(next, "Form data parsing error")
            let updateProduct = {...product}
            if (title) updateProduct.title = title
            if (price) updateProduct.price = Covert.number(price)
            if (discount) updateProduct.discount = Covert.number(discount)
            if (productType) updateProduct.productType = productType
            if (views) updateProduct.views = views
            if (brandId) updateProduct.brandId = brandId
            if (categoryId) updateProduct.categoryId = categoryId
            if (qty) updateProduct.qty = Covert.number(qty)
            if (sku) updateProduct.sku = Covert.number(sku)
    
    

            let attributesObj = await parseJson(attributes)
            if(attributesObj) {
                updateProduct.attributes = attributesObj
            }


            // only change it admin
            if (req.authUser.roles.includes(Roles.ADMIN)) {
                if (fields?.isApproved) updateProduct.isApproved = Covert.boolean(fields.isApproved)
                updateProduct.isMall = true;
            }
            
            if (isActive) updateProduct.isActive = Covert.boolean(isActive)
    
            // detail collection
            let updateProductDetail: ProductDescription = new ProductDescription()
    
            if (shippingCost) updateProductDetail.shippingCost = Covert.number(shippingCost)
            if (summary) updateProductDetail.summary = summary
            if (videoLink) updateProductDetail.videoLink = videoLink
            if (tax) updateProductDetail.tax = Covert.number(tax)
            if (minOrder) updateProductDetail.minOrder = Covert.number(minOrder)


            let highlightArray = await parseJson(highlight)
            // if provide valid json
            if(highlightArray) {
                updateProductDetail.highlight = highlightArray
            }


            let sellerRulesArray = await parseJson(sellerRules)

            // if provide valid json
            if(sellerRulesArray) {
                updateProductDetail.sellerRules = sellerRulesArray
            }


            let specificationObj = await parseJson(specification)
            // if provide valid json
            if(specificationObj) {
                updateProductDetail.specification = specificationObj
            }

            console.log(updateProduct)
    
            // let result = await Product.findAndUpdate<Product>({_id: new ObjectId(id)},
            //     {$set: updateProduct}
            // );
            //
            //
            // if(result){
            //     await ProductDescription.findAndUpdate(
            //         {productId: new ObjectId(id)},
            //         {$set: updateProductDetail},
            //         { upsert: true }
            //     ).then(()=>{
            //         successResponse(res, 201, {message: "product updated", updateProduct});
            //
            //     }).catch(ex=>{
            //         errorResponse(next, "product update fail", StatusCode.InternalServerError);
            //
            //     })
            // }

        })
    } catch (ex) {
        next(ex);
    } finally {
    }
};



// make duplicate product
export const saveProductsAsDuplicate = async (req: Request, res: Response, next: NextFunction) => {
};


export const fetchCategoryProducts = async (req: Request, res: Response, next: NextFunction) => {
    const {categoryId} = req.params;
    const fetchEachSectionItems = 10;
    
    let client;
};



export const productFiltersPost = async (req: Request, res: Response, next: NextFunction) => {
    
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
        brandIds= [],
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

        console.log(attributesValues)

        let categoryIdsOBjs: ObjectId[] = []
        categoryIds?.forEach((id) => {
            categoryIdsOBjs.push(new ObjectId(id))
        })


        let brandObjectIds: ObjectId[] = []
        brandIds.forEach(brand=>{
            if(brand.length === 24) {
                brandObjectIds.push(new ObjectId(brand))
            }
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
                    brandObjectIds && brandObjectIds.length > 0
                        ? {
                            brandId: {$in: [...brandObjectIds]},
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

        let total
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
            isRange=false,
            options,
        } = req.body

        let attribute = await Attributes.findOne({attributeName: attributeName})
        if(attribute) return errorResponse(next, "Attribute already exists", StatusCode.Conflict);

        let attr: any = new Attributes({
            attributeName,
            attributeLabel,
            isRange,
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
            isRange = false,
            options,
        } = req.body
        
        let updateData = {}
        
        if (attributeName) updateData["attributeName"] = attributeName
        if (attributeLabel) updateData["attributeLabel"] = attributeLabel
        if (isRange) updateData["isRange"] = isRange
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