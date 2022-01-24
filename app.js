//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

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

// Encrypt Something
const secret = "Thisisbengilla"; // mongoose-encryption
userSchema.plugin(encrypt, { secret:secret, encryptedFields: ['password'] });

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
    User.findOne({email: req.body.username}, (err, foundUser) => {

      if (!foundUser || err) {
        // console.log(err);
        res.send("You haven't register info");
      } else {
        if (foundUser) {

          if (foundUser.password === req.body.password) {
            res.render("secrets");
          } else {
            res.send("You have wrong password");
          }

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

    const newUser = new User({
      email: req.body.username,
      password: req.body.password
    });

    newUser.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
      }
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
