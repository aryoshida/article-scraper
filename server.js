var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");
var PORT = 3000;
var app = express();
var connectionString = "mongodb+srv://root:root@cluster0-ydthz.mongodb.net/test?retryWrites=true&w=majority";

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect(connectionString, { useNewUrlParser: true });

app.listen(PORT, function(){
    console.log("running on port: " + PORT);
});

//scrapes articles off of the website
// app.get("/scrape", function(req, res){
//     axios.get("https://www.reddit.com/").then(function(response){
//         var $ = cheerio.load(response.data);

//         $("article div").each(function(i, element){
//             var result = {};

//             var linkObject = $(this).children("div");
//             var child1 = $(linkObject).children("div");
//             var child2 = $(child1).children("a");
//             var child3 = $(child2).children("div")

//             result.title = child3.children("h3").text();
//             result.link = child2.attr("href");

//             db.Article.create(result)
//                 .then(function(dbArticle){
//                     // console.log(dbArticle);
//                 })
//                 .catch(function(err){
//                     console.log(err);
//                 });
//         });
//         res.send("Scrape Completed!!!");
//     });
// });

app.get("/scrape", function(req, res){
    axios.get("https://www.foxnews.com/").then(function(response){
        var $ = cheerio.load(response.data);

        $("article div header").each(function(i, element){
            var result = {};

            var linkObject = $(this).children("h2");
            var child1 = $(linkObject).children("a");

            result.title = child1.text();
            result.link = child1.attr("href");
            
            db.Article.create(result)
                .then(function(dbArticle){
                    console.log(dbArticle);
                })
                .catch(function(err){
                    console.log(err);
                });
        });

        res.send("Scrape Complete");

    });
});

//grabs all articles
app.get("/articles", function(req, res){
    db.Article.find({})
    .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    });
});

//grabs a specific article
app.get("/articles/:id", function(req, res){
    db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    });
});

//adds selected article to saved 
app.post("articles/:id", function(req, res){
    db.Note.create(req.body)
        .then(function(dbNote){
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function(dbArticle){
            res.json(dbArticle);
        })
        .catch(function(err){
            res.json(err);
        });
});