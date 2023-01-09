import {Roles} from "../../models/User";
import {ObjectId} from "mongodb";

// to make the file a module and avoid the TypeScript error
export {}

declare global {
    namespace Express {
        export interface Request {
            authUser: {
                _id: ObjectId | string
                storeId: ObjectId | string
                roles: Roles[]
                email: string
            }
        }
    }
}