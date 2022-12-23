import {NextFunction, Request, Response} from "express"
import {errorResponse, successResponse} from "../response";

import Brand from "../models/Brand";
import {ObjectId} from "mongodb";
import fileUpload from "../services/fileUpload/fileUpload";
import {uploadImage} from "../services/cloudinary";
import {StatusCode} from "../types";
import {mongoConnect} from "../services/mongodb/database.service";


export const getBrandsCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let count = await Brand.count()
        successResponse(res, 200, count as any)
    } catch (ex) {
        errorResponse(next, "brands row count fail")
    }
}

export const getBrandsForCategory = async (req: Request, res: Response, next: NextFunction) => {
    
    const {forCategory} = req.body
    
    try {
        const collection = await mongoConnect()
        
        if (forCategory) {
            let allBrands = await collection.collection("brands").find({
                forCategory: {
                    $in: forCategory
                }
            }).toArray();
            
            res.status(200).json({brands: allBrands})
        } else {
            res.status(200).json({brands: []})
        }
        
    } catch (ex) {
        next(ex)
    }
}

export const getBrands = async (req: Request, res: Response, next: NextFunction) => {
    let start = Date.now()
    
    let {perPage = 10, pageNumber = 1} = req.query
    try {
        // let Skip = (perPage as number) * (pageNumber as number - 1)
        
        let brands = await Brand.find<Brand[]>()
        successResponse(res, StatusCode.Ok, brands)
        
    } catch (ex) {
        next(ex)
    }
}

export const getBrandsInfo = async (req: Request, res: Response, next: NextFunction) => {

    let {brandName} =  req.params

    try {

        let names = brandName.split("___").filter(item=> !!item)


        let brands = await Brand.find<Brand[]>({name: {$in: names }})
        successResponse(res, StatusCode.Ok, brands)

    } catch (ex) {
        next(ex)
    }
}

export const getBrand = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let brand = await Brand.findOne<Brand>({_id: new ObjectId(req.params.id)})
        if (brand) {
            successResponse(res, StatusCode.Ok, brand)
        } else {
            errorResponse(next, "not found", StatusCode.NotFound)
        }
        
    } catch (ex) {
        next(ex)
    }
}


// save brand controller
export const saveBrands = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // parse formdata
        fileUpload(req, async (err, {fields, files}) => {
            if (err) return errorResponse(next, "Form data parsing error")
            
            if (err) return errorResponse(next, "Internal Error. Please try Again")
            
            const {name, forCategory = '[]', logo} = fields as any
            
            
            // check it this brand already exists or not
            let result = await Brand.findOne({name: name})
            if (result) return errorResponse(next, "Brand already exists", 401)
            
            let newPath = logo;
            
            if (files && files["logo"]) {
                try {
                    let info = await uploadImage(files["logo"], {dir: "dream-bazar"})
                    newPath = info.secure_url
                } catch (ex) {
                
                }
            }
            
            let c = []
            try {
                c = JSON.parse(forCategory)
            } catch (ex) {
            }
            
            let newBrand = new Brand({
                name,
                logo: newPath,
                forCategory: c,
                createdAt: new  Date(),
                updatedAt: new Date()
            })
            
            newBrand = await newBrand.save() as any
            
            if (!newBrand) return errorResponse(next, "Internal error. Please try Again")
            
            successResponse(res, StatusCode.Created, {
                message: "brand added",
                brand: newBrand
            })
        })
        
    } catch (ex) {
        return errorResponse(next, "Internal error. Please try Again")
    }
}

export const updateBrand = async (req: Request, res: Response, next: NextFunction) => {
    
    try {
        
        let result = await Brand.findOne({_id: new ObjectId(req.params.id)})
        if (!result) return errorResponse(next, "Brand Not found")
        
        fileUpload(req, async (err, {fields, files}) => {
            if (err) return errorResponse(next, "Form data parsing error")
            
            if (err) return errorResponse(next, "Internal Error. Please try Again")
            
            const {name, forCategory = '[]', logo} = fields as any
            
            let newPath = logo;
            
            if (files && files["logo"]) {
                try {
                    let info = await uploadImage(files["logo"], {dir: "dream-bazar"})
                    newPath = info.secure_url
                } catch (ex) {
                    console.log(ex)
                }
            }
            
            
            let c = []
            try {
                c = JSON.parse(forCategory)
            } catch (ex) {
            }
            
            let updatedBrandData = new Brand({})
            if (name) updatedBrandData.name = name
            if (forCategory) updatedBrandData.forCategory = c
            if (newPath) updatedBrandData.logo = newPath
            updatedBrandData.updatedAt = new Date();
            
            // let doc = await updatedBrandData.updateOne(req.params.id, {
            //     $set: {
            //         ...updatedBrandData
            //     }
            // })
            
            // if (!doc) return errorResponse(next, "Brand update fail")
            
            updatedBrandData._id = req.params.id
            successResponse(res, StatusCode.Created, {
                message: "brand updated",
                brand: updatedBrandData
            })
        })
        
    } catch (ex) {
        errorResponse(next, "Brand update fail")
    }
}


export const deleteBrand = async (req: Request, res: Response, next: NextFunction) => {
    
    const {id} = req.params
    
    try {
        let isDeleted = await Brand.deleteById(id)
        if (isDeleted.deletedCount) {
            errorResponse(next, "Brand delete fail")
        } else {
            successResponse(res, StatusCode.Created, {message: "Brand deleted", id});
        }
        
    } catch (ex) {
        next(ex)
    } finally {
    
    }
}
