import dbConnect from "../database"
import {NextFunction, Request, Response} from "express"

import {errorResponse, successResponse} from "../response";
import fileUpload from "../utilities/fileUpload"
import fs from "fs";

import staticDir from "../utilities/staticDir";
import uuid from "../utilities/uuid";

import {deleteOneById, findAll, findOne, insertOne, update} from "../services/sqlite/database.methods";
import {ObjectId} from "mongodb";

const isObjectId = require("../utilities/isObjectId")


export const getBrandsCount = async (req: Request, res: Response, next: NextFunction) => {
    const {_id} = req.query
    let client;
    try {
        const {c: BrandCollection, client: cc} = await dbConnect("brands")
        client = cc

        const doc = await BrandCollection.countDocuments({})
        res.status(200).json({count: doc})
    } catch (ex) {
        next()
        console.log(ex)
    } finally {
        client?.close()
    }
}

export const fetchBrandsWithFilter = async (req: Request, res: Response, next: NextFunction) => {

    let client;
    const {brands = [], forCategoryIds} = req.body

    try {
        const {c: brandCollection, client: cc} = await dbConnect("brands")
        client = cc
        let brandIds = []
        brands.forEach(b => {
            if (isObjectId(b)) {
                brandIds.push(new ObjectId(b))
            }
        })

        let cursor;
        if (forCategoryIds) {
            let catIds = []
            forCategoryIds.forEach(cat => {
                catIds.push(new ObjectId(cat))
            })
            cursor = brandCollection.find({for_category: {$in: catIds}})

        } else {
            cursor = brandCollection.find({_id: {$in: brandIds}})
        }
        let allBrands = []
        await cursor.forEach(brand => {
            allBrands.push(brand)
        })
        res.status(200).json({brands: allBrands})
    } catch (ex) {
        next()
        console.log(ex)
    } finally {
        client?.close()
    }
}


export const getBrands = async (req: Request, res: Response, next: NextFunction) => {

    let {perPage = 10, pageNumber = 1} = req.query


    try {

        let [err, result] = await findAll(`SELECT * FROM brands`)
        if (!err) {
            successResponse(res, 200, result)
        } else {
            successResponse(res, 200, [])
        }

    } catch (ex) {
        next(ex)

    } finally {

    }
}

export const getBrand = async (req: Request, res: Response, next: NextFunction) => {

    try {
        let [err, result] = await findOne("SELECT * FROM brands where id = ?", [req.params.id])
        if (!err && result) {
            successResponse(res, 200, result)
        } else {
            errorResponse(next, "not found", 404)
        }

    } catch (ex) {
        next(ex)
    }
}

export const getBrandsByIds = async (req: Request, res: Response, next: NextFunction) => {
    const {ids} = req.body
    let client;
    try {
        const {c: BrandCollection, client: cc} = await dbConnect("brands")
        client = cc
        let brandIds = []
        let cursor;
        ids && ids.forEach(stringId => {
            brandIds.push(new ObjectId(stringId))
        })

        cursor = BrandCollection.find(
            {_id: {$in: brandIds}}
        )

        let brands = []
        await cursor.forEach(brand => {
            brands.push(brand)
        })
        res.json({brands: brands})

    } catch (ex) {
        next()
        console.log(ex)
    } finally {
        client?.close()
    }
}

// save brand controller
export const saveBrands = async (req: Request, res: Response, next: NextFunction) => {

    // let sql = `
    //      DROP TABLE if EXISTS "brands";
    //      CREATE TABLE "brands" (
    //       id TEXT NOT NULL,
    //       name text(200) NOT NULL,
    //       logo text(500) NOT NULL,
    //       forCategory JSON,
    //       CONSTRAINT "brands_pk" PRIMARY KEY("name", "id")
    // )
    //  `

    try {
        // parse formdata
        let {err, fields, file, fileName} = await fileUpload(req, "logo");
        if (err) {
            return errorResponse(next, "Internal Error. Please try Again")
        }

        const {name, forCategory} = fields as any

        // check it this brand already exists or not
        let [findErr, result] = await findOne("SELECT * FROM brands where name = ?", [name])
        if (!findErr && result) {
            return errorResponse(next, "Brand already exists", 401)
        }


        let newPath = ""

        // move file to our static dir
        if (file) {
            newPath = "upload/" + fileName
            try {
                fs.cpSync(file, staticDir + "/" + newPath)
            } catch (ex) {
            }
        }

        let for_category = []
        if (forCategory) {
            try {
                for_category = JSON.parse(forCategory)
            } catch (_) {
            }
        }

        let id = uuid(10)
        let [err2] = await insertOne(
            "INSERT INTO brands (id, name, logo, forCategory) Values(?, ?, ?, ?)",
            [id, name, newPath, JSON.stringify(for_category)]
        )

        if (err2) {
            return errorResponse(next, "Internal error. Please try Again")
        }

        successResponse(res, 201, {
            message: "brand added",
            brand: {
                id,
                name,
                logo: newPath,
                forCategory: for_category
            }
        })


    } catch (ex) {
        return errorResponse(next, "Internal error. Please try Again")

    } finally {

    }
}

export const updateBrand = async (req: Request, res: Response, next: NextFunction) => {

    try {

        let [findErr, result] = await findOne('select * from brands where id = ?', [req.params.id])
        if (findErr || !result) {
            return errorResponse(next, "Brand Not found")
        }

        let {err, fields, file, fileName} = await fileUpload(req, "logo");
        if (err) {
            return errorResponse(next, "Internal Error. Please try Again")
        }

        const {name, forCategory, logo = ""} = fields as any


        let newPath = logo;


        if (file) {
            newPath = "upload/" + fileName
            try {
                fs.cpSync(file, staticDir + "/" + newPath)
            } catch (ex) {
            }
        }

        let for_category = []
        if (forCategory) {
            try {
                for_category = JSON.parse(forCategory)
            } catch (_) {
            }
        }

        let sql = ''
        let data = []
        let a = {logo: newPath, name, forCategory};
        for (const key in a) {
            if (a[key]) {
                sql += `${key} = ?, `
                data.push(a[key])
            }
        }
        sql = sql.slice(0, sql.lastIndexOf(","))

        sql = "UPDATE brands SET " + sql + " WHERE id = ?"

        let [errRes] = await update(sql, [...data, req.params.id])

        if (errRes) {
            errorResponse(next, "Brand update fail")
        } else {
            successResponse(res, 201, {
                message: "brand updated",
                brand: {
                    id: req.params.id,
                    logo: newPath,
                    name,
                    forCategory: for_category
                }
            })
        }

    } catch (ex) {
        errorResponse(next, "Brand update fail")


    } finally {

    }
}

export const deleteBrand = async (req, res, next) => {

    const {id} = req.params

    try {

        let [err, result] = await deleteOneById("brands", id)
        if (err) {
            errorResponse(next, "Brand delete fail", 500)
        } else {
            successResponse(res, 201, {message: "Brand deleted", id});
        }

    } catch (ex) {
        next(ex)
    } finally {

    }
}
