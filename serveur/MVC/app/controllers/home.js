const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Battle = mongoose.model('Battle');
const randomUser = require('random-user');
const Chance = require('chance');


module.exports = (app) => {
  app.use('/', router);
};

router.get('/scoreboard', (req, res, next) => {
  User.find({}, 'username level currentXP xpMax', (err, dbuser) => {
    if (err) return next(err);
    res.json(dbuser);
  });
});

router.post('/user', (req, res, next) => {
  const playload = req.body;
  let user = new User({
    username: playload.username,
    level: 0,
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
          level: level,
          currentXP: 0,
          xpMax: Math.pow(2, level) * 1000
        })
        user.save(function (err, user) {
          if (err) {
            res.send('already stored');
          } else {

          }
        });
      })
      .catch((err) => console.log(err));
  }
  //res.send('user created');
});
router.post('/battle', (req, res) => {
  const payload = req.body;

  User.find({ "username": { $in: [payload.user1, payload.user2] } }, 'username level currentXP xpMax', (err, dbuser) => {
    if (err) return next(err);

    let winner;
    let looser;

    var chance = new Chance(Math.random);
    let decision = chance.integer({ min: 0, max: 6 });
    //winner is player 0
    if (decision < 4) {
      newXP = dbuser[0].currentXP + 1000;
      levelUP = dbuser[0].level;
      newxpMax = dbuser[0].xpMax;
      if (newXP >= newxpMax) {
        levelUP = dbuser[0].level++;
        newxpMax = dbuser[0].xpMax * 2;
      }
      winner = new User({
        username: dbuser[0].username,
        level: levelUP,
        currentXP: newXP,
        xpMax: newxpMax
      });
      looser = new User({
        username: dbuser[1].username,
        level: dbuser[1].level,
        currentXP: dbuser[1].currentXP,
        xpMax: dbuser[1].xpMax
      });
    //winner is player 1
    } else {
      //update des valeurs du winner
      newXP = dbuser[1].currentXP + 1000;
      levelUP = dbuser[1].level;
      newxpMax = dbuser[1].xpMax;
      if (newXP >= newxpMax) {
        levelUP = dbuser[1].level++;
        newxpMax = dbuser[1].xpMax *2;
      }
      winner = new User({
        username: dbuser[1].username,
        level: levelUP,
        currentXP: newXP,
        xpMax: newxpMax
      });
      looser = new User({
        username: dbuser[0].username,
        level: dbuser[0].level,
        currentXP: dbuser[0].currentXP,
        xpMax: dbuser[0].xpMax
      });
    }
    User.findOneAndUpdate({ "username": winner.username }, { level: levelUP, currentXP: newXP, xpMax: newxpMax }, (err, user) => {
      if (err) {
        res.send(err)
      } else {
        const battle = new Battle({winner : winner.username, looser: looser.username, xpWinner: winner.currentXP, 
          xpLooser : looser.currentXP,levelWinner: winner.level, levelLooser: looser.level});
        battle.save();
        res.send("fight finish");
      }
    });  
  });
});

router.get('/listBattles', (req, res) => {
  
});