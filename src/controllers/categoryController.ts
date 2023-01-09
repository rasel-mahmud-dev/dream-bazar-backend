import {errorResponse, successResponse} from "../response"
import  {NextFunction, Request, Response} from "express";
import Category, {CategoryType} from "../models/Category";
import isObjectId from "../utilities/isObjectId";
import {StatusCode} from "../types";

import {ObjectId} from "mongodb"
// import CategoryDetail from "../models/CategoryDetail";
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
        const categories = await Category.find<Category[]>({}, { projection: {
                name: 1,
                parentId: 1,
                isProductLevel: 1
            } })
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
            const category  = await Category.findOne<CategoryType>({_id: new ObjectId(id as string)})
            if (!category) return errorResponse(next, "category not found", 404)

            if(category.filterAttributes) {
                let allFilterAttributes = await Attributes.find<Attributes[]>({attributeName: {$in: [...category.filterAttributes]}})
                if(allFilterAttributes){
                    category.filterAttributesValues = allFilterAttributes;
                }
            }
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
    
    const { name, parentId=null, isProductLevel=false,  defaultExpand=[], filterAttributes=[], renderProductAttr=[], productDescriptionSection={}} = req.body


    try {


        let category = await Category.findOne({name})
        if (category) {
            return errorResponse(next, "Category Already exists", StatusCode.Conflict)
        }

        let newCategory = new Category({
            name,
            parentId: parentId ? parentId : null,
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

    const { name, parentId, isProductLevel= undefined,  defaultExpand, filterAttributes, renderProductAttr, productDescriptionSection} = req.body
    
    try {
        
        let category = await Category.findOne<Category>({_id: new ObjectId(id)})
        if (!category) return errorResponse(next, "Category not found")

        let updatedCategory: CategoryType = {} as CategoryType
        if(name) updatedCategory.name = name
        if(parentId) updatedCategory.parentId = parentId
        if(isProductLevel !== undefined) updatedCategory.isProductLevel = isProductLevel
        if(defaultExpand) updatedCategory.defaultExpand = defaultExpand
        if(filterAttributes) updatedCategory.filterAttributes = filterAttributes
        if(renderProductAttr) updatedCategory.renderProductAttr = renderProductAttr
        if(productDescriptionSection) updatedCategory.productDescriptionSection = productDescriptionSection

        let updateResult = await Category.findAndUpdate<Category>({_id: new ObjectId(id)}, {
            $set: {
                ...updatedCategory
            }
        })

        if(!updateResult) return errorResponse(next, "category update fail")

        successResponse(res, StatusCode.Created, {
            message: "category updated",
            category: updateResult
        })

        
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




