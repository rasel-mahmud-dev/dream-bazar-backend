import {NextFunction, Request, Response} from "express";
import {errorResponse, successResponse} from "../response";
import {Roles, StatusCode} from "../types";
import Shop from "../models/Shop";
import Validator from "../utilities/validator";
import {ObjectId} from "mongodb";
import fileUpload from "../services/fileUpload/fileUpload";
import {uploadImage} from "../services/cloudinary";


/** Create Shop for seller and admin user.
 *
 * */


export const createShop = async (req: Request, res: Response, next: NextFunction) => {


    fileUpload<any>(req, async (err, {fields, files}) => {
        try {
            if (err) return errorResponse(next, "Form data parsing error")

            const {
                shopName,
                shopEmail,
                shopAddress,
                shopPhone,
            } = fields

            let shop = await Shop.findOne({shopName: shopName});
            if(shop) return errorResponse(next, "This Names Shop already exist")

            let validate = new Validator(
                {
                    shopName: {type: "text", required: true},
                    shopEmail: {type: "text", required: true},
                    shopAddress: {type: "text", required: true},
                    shopPhone: {type: "text", required: true},
                    coverPhoto: {
                        type: "text",
                        required: true,
                        errorMessage: "not allowed",
                    },
                },
                {abortEarly: true}
            );

            let errors = validate.validate({
                shopName,
                shopEmail,
                shopAddress,
                shopPhone,
            });

            if (errors) {
                return errorResponse(next, errors, StatusCode.UnprocessableEntity)
            }

            const newShop = new Shop({
                shopName,
                shopEmail,
                shopAddress,
                shopLogo: "",
                isApproved: !!req.authUser.roles.includes(Roles.ADMIN),
                isActive: !!req.authUser.roles.includes(Roles.ADMIN),
                shopPhone,
                sellerId: new ObjectId(req.authUser._id)
            })


            //  upload image on cloudinary
            let promises: any[] = []

            if (files) {
                for (let filesKey in files) {
                    promises.push(
                        uploadImage(files[filesKey], {dir: "dream-bazar", fieldName: filesKey, overwrite: false})
                    )
                }
            }


            let result = await Promise.allSettled(promises)

            for (let resultElement of result) {
                if (resultElement.status !== "rejected") {

                    if (resultElement.value.fieldName === "shopLogo") {
                        newShop.shopLogo = resultElement.value.secure_url
                    } else {
                        newShop.shopBanner = resultElement.value.secure_url
                    }

                }
            }

            let doc = await newShop.save<Shop>();

            if (doc?._id) {
                successResponse(res, StatusCode.Created, doc)
            } else {
                errorResponse(next, "Shop creating fail")
            }

        } catch (ex) {
            next(ex)
        }
    })
}

export const getShopInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, firstName, lastName, password} = req.body


    } catch (ex) {
        next(ex)
    }
}
