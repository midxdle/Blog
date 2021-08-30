const express = require('express');
const router = express.Router();
const mongo = require('mongodb');
const db = require('monk')("mongodb+srv://midxdle:fFbE2DpWoxmGTAXF@cluster0.axsj3.mongodb.net/nodeblog?retryWrites=true&w=majority");

router.get('/show/:category', function(req, res, next) {
  let posts = db.get('posts');

  posts.find({category: req.params.category}, {}, function(err, posts) {
    res.render('index', {
      'title':req.params.category,
      'posts': posts
    });
  });
});


router.get('/add', function(req, res, next) {
    res.render('adddetail', {
      'title':'Add Detail'
  });
});

router.post('/add', function(req, res, next) {
  // Get Form Values
  let category = req.body.category;
  let author = req.body.author;

  // Form Validation
  req.checkBody('category', 'Category field is required').notEmpty();
  req.checkBody('author', 'Author field is required').notEmpty();

  // Check Errors
  let errors = req.validationErrors();

  if(errors) {
    req.flash('error', 'Fields required');
    res.location('/details/add');
    res.redirect('/details/add');
    // res.render('addpost', {
    //   "errors": errors
    // });
  } else {
    let categories = db.get('categories');
    categories.insert({
      "category": category,
      "author": author
    }, function(err, post) {
      if(err) {
        res.send(err);
      } else {
        req.flash('success', 'Detail Added');
        res.location('/');
        res.redirect('/');
      }
    });
  }
});

module.exports = router;