import * as mongoDB from "mongodb";
import {Collection, Db, ObjectId} from "mongodb";
import {mongoConnect} from "../services/mongodb/database.service";

class Base {

    // using caching for static and instance method
    private static _database: Db
    static collectionName: string;
    collectionName = ""

    constructor(collectionName) {
        // call when call with new keyword extend classes...
        Base.collectionName = collectionName;
    }


    static async getDatabase(collectionName: string): Promise<Collection> {
        if (!Base._database) {
            Base._database = await mongoConnect()
        }

        return Base._database.collection(collectionName)
    }


    static get collection(): Promise<Collection> {
        return Base.getDatabase(this.collectionName)
    }

    save<T>() {
        return new Promise<T | null>(async (resolve, reject) => {
            try {
                let {collectionName, ...other} = this;

                let doc = await (await Base.getDatabase(Base.collectionName)).insertOne(other)
                if (doc.insertedId) {
                    (other as any)._id = doc.insertedId
                    resolve(other as T)
                } else {
                    resolve(null);
                }
            } catch (ex) {
                reject(ex);
            }
        });
    }


    updateOne<T>(filter: mongoDB.Filter<mongoDB.Document>, update: Partial<mongoDB.Document> | mongoDB.UpdateFilter<mongoDB.Document>) {
        return new Promise<T | null>(async (resolve, reject) => {
            try {
                let {collectionName, ...other} = this;
                let doc = await (await Base.getDatabase(collectionName)).updateOne(filter, update);
                if (doc) {
                    resolve(other as T)
                } else {
                    resolve(null);
                }
            } catch (ex) {
                reject(ex);
            }
        });
    }

    static findAndUpdate<T>(filter: mongoDB.Filter<mongoDB.Document>, update: Partial<mongoDB.Document> | mongoDB.UpdateFilter<mongoDB.Document>, options?: mongoDB.UpdateOptions) {
        return new Promise<T | null>(async (resolve, reject) => {
            try {
                let {collectionName, ...other} = this;
                let doc = await (await Base.getDatabase(collectionName)).updateOne(filter, update, options ? options : {});
                if (doc) {
                    resolve(other as T)
                } else {
                    resolve(null);
                }
            } catch (ex) {
                reject(ex);
            }
        });
    }

    static findOneAndUpdate(
        filter: mongoDB.Filter<mongoDB.Document>,
        update: mongoDB.UpdateFilter<mongoDB.Document>
    ) {
        return new Promise<mongoDB.ModifyResult<mongoDB.Document>>(
            async (resolve, reject) => {
                try {
                    let doc = await (await Base.getDatabase(this.collectionName)).findOneAndUpdate(filter, update);
                    resolve(doc);
                } catch (ex) {
                    reject(ex);
                }
            }
        );
    }

    static deleteById(id: string) {
        return new Promise<mongoDB.DeleteResult>(async (resolve, reject) => {
            if (!id) {
                return reject("please provide id");
            }

            try {
                let doc = (await Base.getDatabase(this.collectionName)).deleteOne({_id: new ObjectId(id)});
                resolve(doc);
            } catch (ex) {
                reject(ex);
            }
        });
    }

    static count() {
        return new Promise<number>(async (resolve, reject) => {
            try {
                let doc = await (await Base.getDatabase(this.collectionName)).countDocuments();
                resolve(doc);
            } catch (ex) {
                reject(ex);
            }
        });
    }


    static findOne<T>(filter: mongoDB.Filter<mongoDB.Document>) {
        return new Promise<T>(async (resolve, reject) => {
            try {
                let doc = (await Base.getDatabase(this.collectionName)).findOne(filter) as T
                console.log(doc)
                resolve(doc);
            } catch (ex) {
                reject(ex);
            }
        });
    }

    static find<T>(filter?: mongoDB.Filter<mongoDB.Document>, options?: mongoDB.FindOptions<mongoDB.Document>) {
        Base.collectionName = this.collectionName
        return new Promise<T>(async (resolve, reject) => {
            try {
                let docs = await (await Base.getDatabase(this.collectionName))
                    .find(filter ? filter : {}, options)
                    .toArray() as T
                resolve(docs);
            } catch (ex) {
                reject(ex);
            }
        });
    }

    static aggregate(pipeline: any) {
        return new Promise(async (resolve, reject) => {
            try {
                let doc = await (await Base.getDatabase(this.collectionName)).aggregate(pipeline).toArray()
                resolve(doc)

            } catch (ex) {
                reject(ex)
            }
        })
    }
}

export default Base