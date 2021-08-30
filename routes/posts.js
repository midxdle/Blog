const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: './public/images' })
const mongo = require('mongodb');
const db = require('monk')("mongodb+srv://midxdle:fFbE2DpWoxmGTAXF@cluster0.axsj3.mongodb.net/nodeblog?retryWrites=true&w=majority");

router.get('/show/:id', function(req, res, next) {
  let posts = db.get('posts');
  posts.findOne({ _id: req.params.id }, function(err, post) {
    res.render('show', {
      'post': post
    });
  });
});

router.get('/add', function(req, res, next) {

  let details = db.get('categories');

  details.find({}, {}, function(err, categories) {
    res.render('addpost', {
      'title':'Add Post',
      'categories': categories
    });
  });
})

router.post('/add', upload.single('mainimage'), function(req, res, next) {
  // Get Form Values
  let title = req.body.title;
  let category = req.body.category;
  let body = req.body.body;
  let author = req.body.author;
  let date = new Date();

  // Check Image Upload
  if(req.file) {
    var mainimage = req.file.filename;
  } else {
    var mainimage = 'noimage.jpg';
  }

  // Form Validation
  req.checkBody('title', 'Title field is required').notEmpty();
  req.checkBody('body', 'Body field is required').notEmpty();

  // Check Errors
  let errors = req.validationErrors();

  if(errors) {
    req.flash('error', 'Fields required');
    res.location('/posts/add');
    res.redirect('/posts/add');
    // res.render('addpost', {
    //   "errors": errors
    // });
  } else {
    let posts = db.get('posts');
    posts.insert({
      "title": title,
      "body": body,
      "category": category,
      "date": date,
      "author": author,
      "mainimage": mainimage,
    }, function(err, post) {
      if(err) {
        res.send(err);
      } else {
        req.flash('success', 'Post Added');
        res.location('/');
        res.redirect('/');
      }
    });
  }
});

router.post('/addcomment', function(req, res, next) {
  // Get Form Values
  let name = req.body.name;
  let email = req.body.email;
  let body = req.body.body;
  let postid = req.body.postid;
  let commentdate = new Date();

  // Form Validation
  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Email field is required but never displayed').notEmpty();
  req.checkBody('email', 'Email field is invalid').isEmail();
  req.checkBody('body', 'Body field is required').notEmpty();

  // Check Errors
  let errors = req.validationErrors();

  if(errors) {
    let posts = db.get('posts');
    posts.findOne({ _id: postid }, function(err, post) {
      res.render('show', {
        'post': post,
        'errors': errors
      });
    });
  } else {
    let comment = {
      "name": name,
      "email": email,
      "body": body,
      "commentdate": commentdate
    }

    let posts = db.get('posts');

    posts.update({
      "_id": postid
    }, {
      $push:{
        "comments": comment
      }
    }, function(err, doc) {
      if(err) {
        throw err;
      } else {
        req.flash('success', 'Comment Added');
        res.location('/posts/show/'+postid);
        res.redirect('/posts/show/'+postid);
      }
    });
  }
});

module.exports = router;
