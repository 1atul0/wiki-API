const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _=require('lodash/capitalize');
const capitalize = require("lodash/capitalize");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//connecting local server database
mongoose
  .connect("mongodb://localhost:27017/wikiDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected to database"))
  .catch((err) => console.error(err));

//making schema of wikiDB
const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
});
//making model of that schema
const Article = mongoose.model("Article", articleSchema);

////////////////////// targeting for all articles////////////////

app
  .route("/articles")
  .get(function (req, res) {
    Article.find()
      .then((foundArticles) => {
        // console.log(foundArticles);
        if(foundArticles)
        res.send(foundArticles);
        else
        res.send("no article found");
      })
      .catch((err) => {
        res.send(err);
        console.error(err);
      });
  })
  .post(function (req, res) {
    // console.log(req.body.title);
    // console.log(req.body.content);
    //make new article send by user
    const article = new Article({
      title: capitalize(req.body.title),
      content: req.body.content,
    });
    //save that article in database
    article
      .save()
      .then(() => {
        console.log("successfully inserted in articles");
        res.send("successfully added new article");
      })
      .catch((err) => {
        console.error(err);
        res.send("something went wrong. please try again!");
      });
  })
  .delete(function (req, res) {
    Article.deleteMany()
      .then(function () {
        res.send("successfully deleted all articles");
      })
      .catch((err) => {console.error(err)
      res.send("error during deletd in articles");
      });
  });

//////////////////////targeting for specfic articles?/////
app
  .route("/articles/:articleTitle")
  .get(function (req, res) {
    Article.findOne({ title:  capitalize(req.params.articleTitle) })
      .then((foundArticle) => {
        if (foundArticle) {
          res.send(foundArticle);
        } else {
          res.send("No articles matching that title was found");
        }
      })
      .catch((err) => {console.error(err)
      res.send("error during search specfic article");
      });
  })
  //this method replaced all previous data with new data
  .put(function (req, res) {
    Article.replaceOne(
      { title: capitalize(req.params.articleTitle) },
      { title: req.body.title, content: req.body.content }
    )
      .then(() => {
        console.log("successfully replaced selected data");
        res.send("succefully replaced selected previous data");
      })
      .catch((err) => {
        res.send(err);
        console.error(err);
      });
  })

  .patch(function (req, res) {
    const userData=req.body;
    const update={$set:userData};
    Article.updateOne({ title: capitalize(req.params.articleTitle) }, update,{new:true})
      .then(function(data){
        console.log("successfully updated selected data");
        // res.send("successfully updated selected data");
        res.send(data);
      })
      .catch((err)=>res.send(err));
  })
  .delete(function(req,res){
    
    Article.findOneAndDelete({title:capitalize(req.params.articleTitle)})
    .then(()=>{
      console.log("successfully deleted specific route");
      res.send("successfully deleted specific route ");
    })
    .catch(()=>{
      console.error(err);
      res.send(err);
    })
  });

app.listen(3000, function () {
  console.log("server started at port 3000 ");
});

// new method for configuring route
// app.route("/article")
// .get(function(req,res){})
// .post(function(req,res){})
// .delete(function(req,res){});
