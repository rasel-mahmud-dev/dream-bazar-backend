import path from "path";

const isDev = process.env.NODE_ENV === "development"

const dataDir =  path.resolve(isDev ? "src/data" : "dist/data")


export default dataDir