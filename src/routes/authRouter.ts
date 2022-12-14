import {Router} from "express";

const passport = require("passport")
import isAuth from "../middlewares/isAuth"


import {adminAuthLoading, adminLogin} from "../controllers/adminController";
import {googleLoginController} from "../controllers/authController";

const authController = require("../controllers/authController")


export default function (app: Router){
  
  app.post("/api/auth/login", authController.login)
  
  app.post("/api/admin/login", adminLogin)

  app.post("/api/auth/registration", authController.registration)

  // @ts-ignore
    app.get("/api/auth/current-auth", isAuth(),  authController.currentAuth)
    
    app.get("/api/auth/admin/current-auth",adminAuthLoading)
  
  // app.get("/api/auth/fetch-profile/:user_id", isAuth, authController.fetchProfile)
  //

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback


// route call via react js
app.get('/api/auth/google',
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function will be called,
//   which, in this example, will redirect the user to the home page.

// call by react js when google callback 
app.get('/api/auth/callback/google', passport.authenticate('google'), googleLoginController)


app.get('/api/auth/facebook',
  passport.authenticate('facebook')
);


app.get('/api/auth/callback/facebook',
  passport.authenticate('facebook'),
  function(req, res) {
    // Successful authentication, redirect home.
    // res.redirect('/');
    console.log("okkk")
  });

// route call via react js
// app.get('/api/auth/facebook', async (req, res)=>{ 
  
//     // var my_date = Date.now()
//   // console.log(mongodb.ISODate())
//     const { c: UserCollection, client} = await dbConnect("users") 
//     let f = await UserCollection.deleteMany({
//       username: "name"
//     })
//     // let f = await UserCollection.deleteMany({
//     //   username: "name",
//     //   email: "email",
//     //   avatar: "picture",
//     //   password: "",
//     //   phone: "",
//     //   created_at:  new Date()
//     // })
//     // console.log(f)
// })
//   // passport.authenticate('google', { scope : ['profile', 'email'] }));

}

