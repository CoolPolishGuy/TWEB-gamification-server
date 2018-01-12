const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Batlle = mongoose.model('Battle');
const randomUser = require('random-user');
const Chance = require('chance');


module.exports = (app) => {
  app.use('/', router);
};

router.get('/', (req, res, next) => {
  Article.find((err, articles) => {
    if (err) return next(err);
    res.render('index', {
      title: 'Generator-Express MVC',
      articles: articles
    });
  });
});

router.post('/user', (req, res, next) => {
  const playload = req.body;
  let user = new User({
    username: playload.username,
    score: 0,
    currentXP: 0,
    xpMax: 0
  });
  user.save(function (err, user) {
    if (err) {
      res.send('already stored');
    } else {
      res.send('user created');
    }
  });
});

router.post('/init', (req, res) => {
  for (let i = 0; i < 15; i++) {
    const playload = req.body;
    var chance = new Chance(Math.random);
    let level = chance.integer({ min: 0, max: 5 });
    let user;
    let randomGuy = randomUser('simple')

      .then((data) => {
        user = new User({
          username: data.username,
          score: level,
          currentXP: 0,
          xpMax: Math.pow(2,level) * 1000
        })
        user.save(function (err, user) {
          if (err) {
            res.send('already stored');
          } else {
            //res.send('user created');
          }
        });
      })
      .catch((err) => console.log(err));
  }
});
router.post('/battle',(req, res) => {
  const payload = req.body;
  let user1 = db.collection('users').find({"username": payload.user1});
  let user2 = db.collection('users').find({"username": payload.user2});


  console.log(user2);
  res.send("fight finish");
});