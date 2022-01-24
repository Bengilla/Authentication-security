//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


// mongoose connect
mongoose.connect("mongodb://localhost:27017/userDB");


// mongoose Schema , 因为用了 mongoose-encrypt，所以需要改 Schema 为 new mongoose.Schema
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});


const User = mongoose.model("User", userSchema); // 这行必须在 secret 下面
// mongoose End-------------------------------------


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
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, (err, foundUser) => {

      if (!foundUser || err) {
        // console.log(err);
        res.send("You haven't register info");
      } else {
        if (foundUser) {
          bcrypt.compare(password, foundUser.password, function(err, result) {
            // result == true
            if (result === true) {
              res.render("secrets");
            } else {
              res.send("You have wrong password")
            }
          });
        }
      }

    }); // findOne End
  }); // Post End

// Register Route
app.route("/register")

  .get(function(req, res) {
    res.render("register");
  })

  .post(function(req, res) {

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      // Store hash in your password DB.
      const newUser = new User({
        email: req.body.username,
        password: hash
      });
  
      newUser.save(function(err) {
        if (err) {
          console.log(err);
        } else {
          res.render("secrets");
        }
      });
    });

  });



// Start Listen
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log("Server running");
}); // End Listen
