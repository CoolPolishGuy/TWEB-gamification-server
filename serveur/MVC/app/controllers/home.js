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

router.get('/init', (req, res) => {
  let tabPromsies = [];
  for (let i = 0; i < 15; i++) {
    tabPromsies.push(new Promise((success, fail) => {
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
              success();
            }
          });
        })
        .catch((err) => console.log(err));

    }));
  }
  Promise.all(tabPromsies).then(function () {
    res.send('list created');
  });
});
router.post('/battle', (req, res) => {
  const payload = req.body;
  var listUsers = [];
 
  //récuperation d'un joueur opposant
  User.find({}, 'username level currentXP xpMax', (err, dbusers) => {
    var chance = new Chance(Math.random);
    let PeopleDb = dbusers.length -1;
    let opponent = chance.integer({ min: 0, max: PeopleDb });



    if (dbusers[opponent].username == payload.username) {
      opponent = (opponent + 1) % 15;
      listUsers.push(dbusers[opponent]);
    } else {
      listUsers.push(dbusers[opponent]);
    }
    User.find({ "username": payload.user1 }, 'username level currentXP xpMax', (err, dbuser) => {
      if (err) return next(err);

      let winner;
      let looser;
      let otherGuy;

      let decision = chance.integer({ min: 0, max: 6 });

      //winner is player 0
      if (decision < 4) {
        newXP = dbuser[0].currentXP + 1000;
        levelUP = dbuser[0].level;
        newxpMax = dbuser[0].xpMax;
        if (newXP >= newxpMax) {
          levelUP = ++dbuser[0].level;
          newxpMax = dbuser[0].xpMax * 2;
        }
        winner = new User({
          username: dbuser[0].username,
          level: levelUP,
          currentXP: newXP,
          xpMax: newxpMax
        });
        looser = new User({
          username: listUsers[0].username,
          level: listUsers[0].level,
          currentXP: listUsers[0].currentXP,
          xpMax: listUsers[0].xpMax
        });
        //winner is player 1
      } else {
        //update des valeurs du winner
        newXP = listUsers[0].currentXP + 1000;
        levelUP = listUsers[0].level;
        newxpMax = listUsers[0].xpMax;
        if (newXP >= newxpMax) {
          levelUP = ++listUsers[0].level;
          newxpMax = listUsers[0].xpMax * 2;
        }
        winner = new User({
          username: listUsers[0].username,
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
          const battle = new Battle({
            winner: winner.username, looser: looser.username, xpWinner: winner.currentXP,
            xpLooser: looser.currentXP, levelWinner: winner.level, levelLooser: looser.level
          });
          battle.save();
          res.send("fight finish");
        }
      });
    });
  })
});

router.get('/clearData', (req, res) => {
  mongoose.connection.collections['users'].drop(function (err) {
  });
  res.send("DB cleared");
});

router.post('/historyfights', (req, res) => {
  const payload = req.body;
  Battle.find({ $or: [{ winner: payload.username }, { looser: payload.username }] }, 'winner looser xpWinner xpLooser levelWinner levelLooser', (err, battles) => {
    if (err) {
      res.send(err);
    } else {
      res.json(battles);
    }
  });
});