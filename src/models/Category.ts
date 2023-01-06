import Base from "./Base";
import {IndexType} from "../services/mongodb/models.index.types";


export interface CategoryType {
    _id?: string
    name?: string
    parentId?: string | null
    isProductLevel?: boolean
    logo?: string
    filterAttributes: string[]
    defaultExpand: string[]
    renderProductAttr: string[]
    productDescriptionSection?: {[key: string]: string[]}
    createdAt?: Date | string
    updatedAt?: Date | string
}

class Category extends Base implements CategoryType {
    _id?: string
    name?: string
    parentId: string | null
    isProductLevel?: boolean
    logo?: string
    filterAttributes: string[]
    defaultExpand: string[]
    renderProductAttr: string[]
    productDescriptionSection?: {[key: string]: string[]}
    createdAt?: Date | string = new Date()
    updatedAt?: Date | string = new Date()
    
    static indexes: IndexType = {
        name: {
            unique: true
        },
        isProductLevel: {}
    }
    static collectionName = "categories"
    
    
    constructor(data: CategoryType) {
        super(Category.collectionName)
        this.parentId = data.parentId ?? null
        this.name = data.name
        this.logo =  data.logo
        this.defaultExpand = data.defaultExpand
        this.filterAttributes = data.filterAttributes
        this.renderProductAttr = data.renderProductAttr
        this.productDescriptionSection = data.productDescriptionSection
        this.isProductLevel =  data.isProductLevel
    }
}


module.exports = Category
export default Category
