//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require('passport-local-mongoose');


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: 'Our little secret.',
  resave: false,
  saveUninitialized: false
  }));

app.use(passport.initialize());
app.use(passport.session());

// mongoose connect
mongoose.connect("mongodb://localhost:27017/userDB");


// mongoose Schema , 因为用了 mongoose-encrypt，所以需要改 Schema 为 new mongoose.Schema
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema); // 这行必须在 secret 下面
// mongoose End-------------------------------------

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Home Begin
app.route("/")

  .get(function(req, res) {

    res.render("home");

  }); // Home End

// Login Route
app.route("/login")

  .get(function(req, res) {
    res.render("login");
  })

  .post(function(req, res) {
    const user = new User({
      username: req.body.username,
      password: req.body.password  
    });

    req.login(user, function(err) {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function() {
          res.redirect("/secrets");
        });
      }
    })

  }); // Post End


// Secrets Route
app.route("/secrets")

  .get(function(req, res) {
    if (req.isAuthenticated()){
      res.render("secrets");
    } else {
      res.redirect("/login");
    }
  }); // Secrets End


// Register Route
app.route("/register")

  .get(function(req, res) {
    res.render("register");
  })

  .post(function(req, res) {
    User.register({username: req.body.username}, req.body.password, function(err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function() {
          res.redirect("/secrets");
        });
      }
    });

  });


// Logout Route
app.route("/logout")

  .get(function(req, res) {
    req.logout();
    res.redirect("/");
  });





// Start Listen
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log("Server running");
}); // End Listen
