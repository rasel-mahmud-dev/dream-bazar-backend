import * as mongoDB from "mongodb";
import {Db, MongoClient} from "mongodb";

const mongoClient = new MongoClient(process.env.DB_CONN_STRING as string);
const clientPromise = mongoClient.connect();
let database: Db;

export async function mongoConnect() {
    return new Promise<mongoDB.Db>((async (resolve, reject) => {
        try {
            if (!database) {
                database = (await clientPromise).db(process.env.DB_NAME);
            }
            resolve(database)
        } catch (ex) {
            reject(ex)
        }
    }))
}


// for initial database connection and create indexes
export async function initialMongodbIndexes() {
    
    const Product = require("../../models/Product");
    const User = require("../../models/User");
    const Shop = require("../../models/Shop");
    const Brand = require("../../models/Brand");
    const Category = require("../../models/Category");
    const CategoryDetail = require("../../models/CategoryDetail");
    const Review = require("../../models/Review");
    const Attributes = require("../../models/Attributes");
    const ProductDescription = require("../../models/ProductDescription");
    
    const COLLECTIONS = [
        User, Product, Shop, Product,
        Category, Brand, Review,
        CategoryDetail,
        Attributes,
        ProductDescription]
    
    return new Promise((async () => {
        try {
            let client = (await clientPromise)
            
            let db = client.db(process.env.DB_NAME);
            
            COLLECTIONS.forEach((colItem) => {
                let collection = db.collection(colItem.collectionName)
                let indexes = colItem.indexes;
                if (!indexes) return;
                for (let indexesKey in indexes) {
                    collection.createIndex([indexesKey], indexes[indexesKey] as any, (a) => {
                        if (a) {
                            console.log(a.message)
                        } else {
                            console.log(`${colItem.name} collection indexed completed`)
                        }
                    })
                }
            })
        } catch (ex: any) {
            console.log(ex.message)
        }
    }))
    
}
