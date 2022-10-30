import {ObjectId} from "mongodb";
import {IndexType} from "../services/mongodb/models.index.types";
import Base from "./Base";
import {Roles} from "../types";


interface SellerType {
    _id?: ObjectId | string
    firstName: string
    lastName?: string
    email: string
    phone: string
    password?: string
    avatar?: string
    isActive?: boolean
    isSuspense?: boolean
    createdAt?: Date
    roles: Roles[]
    updatedAt?: Date
}


class Seller extends Base implements SellerType{
    public _id?: ObjectId | string
    public firstName: string
    public lastName?: string
    public email: string
    public phone: string
    public password?: string
    public avatar?: string
    public isActive?: boolean
    public isSuspense?: boolean
    public createdAt?: Date
    public updatedAt?: Date
    public roles: Roles[]
    
    
    static collectionName = "sellers"
    
    static indexes: IndexType = {
        email: {
            unique: true,
        },
        phone: {
            unique: true,
        }
    }
    
    constructor(data: SellerType) {
        super(Seller.collectionName)
        this.firstName = data.firstName
        this.lastName = data.lastName
        this.email = data.email
        this.phone = data.phone
        this.password = data.password
        this.avatar = data.avatar
        this.isActive = false
        this.roles = [Roles.SELLER]
        this.isSuspense = false
        this.createdAt = new Date()
        this.updatedAt = new Date()
    }
}

module.exports = Seller
export default Seller