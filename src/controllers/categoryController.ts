import {errorResponse, successResponse} from "../response"
import  {NextFunction, Request, Response} from "express";
import Category from "../models/Category";
import isObjectId from "../utilities/isObjectId";
import {StatusCode, TypedRequestBody} from "../types";

import {ObjectId} from "mongodb"
import CategoryDetail from "../models/CategoryDetail";
import Attributes from "../models/Attributes";


export const getCategoriesCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const count = await Category.count()
        res.send(count)
    } catch (ex) {
        next(ex)
    }
}


/**
 get all flat database categories
 */
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await Category.find<Category[]>({})
        res.send(categories)
        
    } catch (ex) {
        next(ex)
    }
}

/**
 Get flat single category
 */
export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
    const {name, parentId, id} = req.query


    try {
        if(id){
            const category  = await Category.findOne({_id: new ObjectId(id as string)})
            if (!category) return errorResponse(next, "category not found", 404)
            return successResponse(res, StatusCode.Ok, category)
        }
        if(name){
            const category  = await Category.findOne({name: name})
            if (!category) return errorResponse(next, "category not found", 404)
            return successResponse(res, StatusCode.Ok, category)

        }
        if (parentId && isObjectId(parentId)) {
            const category  = await Category.findOne({parentId: parentId})
            if (!category) return  errorResponse(next, "category not found", 404)
            return successResponse(res, StatusCode.Ok, category)
        }

        errorResponse(next, "please provide query params name or parentId", 500)
        
    } catch (ex) {
        next(ex)
        
    }
}

// add a new category
export const saveCategory = async (req: Request, res: Response, next: NextFunction) => {
    
    const { name, parentId, isProductLevel,  defaultExpand, filterAttributes, renderProductAttr=[], productDescriptionSection={}} = req.body


    try {

        if(!(filterAttributes && filterAttributes.length > 0)){
            return errorResponse(next, "Please provide valid credential", StatusCode.Forbidden)
        }

        let category = await Category.findOne({name})
        if (category) {
            return errorResponse(next, "Category Already exists", StatusCode.Conflict)
        }


        let newCategory = new Category({
            name,
            parentId: parentId ? parentId : null,
            logo: "",
            isProductLevel: isProductLevel,
            defaultExpand,
            filterAttributes,
            renderProductAttr,
            productDescriptionSection,
        })


        newCategory = await newCategory.save<any>()

        if (!newCategory) {
            return errorResponse(next, "Internal error. Please try Again")
        }

        successResponse(res, StatusCode.Created, {
            message: "category created",
            category: newCategory
        })
    } catch (ex) {
        next(ex)
        
    }
    
}

// update category
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params
    
    const {name, parentId, isProductLevel, ideals} = req.body
    
    try {
        
        let category = await Category.findOne<Category>({_id: new ObjectId(id)})
        if (!category) return errorResponse(next, "Category not found")
        
        
        category = new Category({
            name: name,
            parentId: parentId,
            isProductLevel: isProductLevel ? isProductLevel : false,
            logo: "",
            ideals: ideals ?? []
        })
        //
        // let updateResult = await category.updateOne<Category>(id, {
        //     $set: {
        //         ...category
        //     }
        // })
        // if(!updateResult) return errorResponse(next, "category update fail")
        //
        // successResponse(res, 201, {
        //     message: "category updated",
        //     category: updateResult
        // })

        
    } catch (ex) {
        errorResponse(next, "category update fail")
        
    }
}

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params
    
    try {
        
        let isDeleted = await Category.deleteById(id)
        if (isDeleted.deletedCount) {
            return successResponse(res, 201, {message: "Category deleted", id});
        }
        
        errorResponse(next, "Category delete fail", 500)
        
    } catch (ex) {
        next(ex)
    } finally {
    
    }
}


export const getAllCategoryDetails = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        
        let details = await CategoryDetail.aggregate([
            { $lookup: {
                from: "categories",
                    localField: "catId",
                    foreignField: "_id",
                    as: "currentCategory"
            } },
            { $unwind: {path: "$currentCategory", preserveNullAndEmptyArrays: true } }
        ])
        successResponse(res, StatusCode.Ok, details)
        
    } catch(ex){
        next(ex)
    }
}

export const getCategoryDetail = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const { categoryId, id} = req.query
        
        if(id && isObjectId(id)) {
            let categoryDetail: any = await CategoryDetail.findOne({_id: new ObjectId(id as string)})
            if (!categoryDetail) {
                return errorResponse(next, "category details not found")
            }
    
            categoryDetail.filterAttributesValues = await Attributes.find({attributeName: {$in: [...categoryDetail.filterAttributes]}})
            return successResponse(res, StatusCode.Ok, categoryDetail)
        }
    
    
    
        if(categoryId && isObjectId(categoryId)) {
            let categoryDetail: any = await CategoryDetail.findOne({catId: new ObjectId(categoryId as string)})
            if(!categoryDetail){
                return errorResponse(next, "category details not found")
            }

            categoryDetail.filterAttributesValues = await Attributes.find({attributeName: {$in: [...categoryDetail.filterAttributes]}})
            return  res.send(categoryDetail)
        }
    
        errorResponse(next, "Please provide id or catId", StatusCode.UnprocessableEntity)
        
    } catch(ex){
        next(ex)
    }
}


export const updateCategoryDetail = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const {detailId} = req.params
        if(!isObjectId(detailId)){
            return errorResponse(next, "please provide valid category id")
        }
        
        // description
        const {catId, defaultExpand, filterAttributes, catName, productDescriptionSection} = req.body
        
        let updated = {}
        if(catId) updated["catId"] = new ObjectId(catId)
        if(defaultExpand) updated["defaultExpand"] = defaultExpand
        if(filterAttributes) updated["filterAttributes"] = filterAttributes
        if(productDescriptionSection) updated["productDescriptionSection"] = productDescriptionSection
        if(catName) updated["catName"] = catName
        
        let doc = await CategoryDetail.findOneAndUpdate({
                _id: new ObjectId(detailId as string)
            },
            {
            $set: updated
        })
        
        if(doc.ok){
           successResponse(res, StatusCode.Created, updated)
        } else {
            errorResponse(next, "Update fail", StatusCode.InternalServerError)
        }
        
    } catch(ex){
        next(ex)
    }
}



export const deleteCategoryDetail = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const {detailId} = req.params
        if(!isObjectId(detailId)){
            return errorResponse(next, "please provide valid category id")
        }
        let doc = await CategoryDetail.deleteById(detailId)
        if(doc.deletedCount){
           successResponse(res, StatusCode.Ok, "Deleted")
        } else {
            errorResponse(next, "Delete fail", StatusCode.InternalServerError)
        }
        
    } catch(ex){
        next(ex)
    }
}




