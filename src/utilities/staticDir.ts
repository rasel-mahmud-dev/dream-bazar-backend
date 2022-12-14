import path from "path";

const isDev = process.env.NODE_ENV === "development"

// only for development environment
// share client/public/static for static files path
const staticDir =  isDev ? path.resolve("../client/public/static") : ""


// for vercel use static files from client static files
// const staticDir =  path.resolve(isDev ? "../client/public/static" : "dist/data")

export default staticDir