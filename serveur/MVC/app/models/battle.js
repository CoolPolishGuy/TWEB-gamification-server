const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BattleSchema = new Schema({
  user1 : String,
  user2 : String,
  winner : String,
  xpWinner : Number,
  xpLoser : Number,
  levelWinner: Number,
  levelLoser: Number

});

BattleSchema.virtual('date')
  .get(() => this._id.getTimestamp());

mongoose.model('Battle', BattleSchema);