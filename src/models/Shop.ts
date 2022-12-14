import {ObjectId} from "mongodb";
import {IndexType} from "../services/mongodb/models.index.types";
import Base from "./Base";


export interface ShopType {
    _id?: ObjectId | string
    sellerId?: ObjectId| string
    shopName: string
    shopAddress: string
    shopLogo: string
    shopBanner?: string
    shopPhone: string
    isActive: boolean
    isSuspense?: boolean
    isApproved: boolean
    createdAt?: Date
    updatedAt?: Date
}


class Shop extends Base implements ShopType{
    public _id?: ObjectId | string
    public sellerId?: ObjectId | string
    public shopName: string
    public shopAddress: string
    public shopLogo: string
    public shopBanner?: string
    public shopPhone: string
    public isActive: boolean
    public isApproved: boolean
    public isSuspense?: boolean
    public createdAt?: Date
    public updatedAt?: Date
    
    static collectionName = "shops"
    
    static indexes: IndexType = {
        shopName: {
            unique: true,
        },
        sellerId: {
            unique: true,
        }
    }
    
    constructor(data?: ShopType) {
        super(Shop.collectionName)
        if(!data) return
        this.sellerId = data.sellerId
        this.shopName = data.shopName
        this.shopPhone = data.shopPhone
        this.shopLogo = data.shopLogo
        this.shopBanner =  data.shopBanner
        this.shopAddress = data.shopAddress
        this.isActive = data.isActive
        this.isSuspense = data.isSuspense
        this.createdAt = data.createdAt
        this.isApproved = data.isApproved
        this.updatedAt = data.updatedAt
    }
}

module.exports = Shop
export default Shop
