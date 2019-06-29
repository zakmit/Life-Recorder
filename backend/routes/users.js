var express = require('express');
const communication = require('../mongoose/communication');
const accessUser = require('../mongoose/accessUser')
var router = express.Router();
var cors = require('cors');
var databaseID = 0;
var corsOptions = {
    origin: 'http://example.com',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}


// check whether user exist
router.get('/user', cors(), function(req, res, next) {
  if(req.query.userId)
    accessUser.signUser(req.query.userId, databaseID, res)
});
/* GET users listing. */
router.get('/:userId/task/:taskId', function(req, res, next) {
  res.send(req.params);
});
router.options('/userpref/', cors());
router.post('/userpref/', cors(), function(req, res, next) {
  if(req.body.userId)
    accessUser.changeUserPref(req.body.userId, req.body, res);
});
router.get('/userpref/', cors(), function(req, res, next) {
  if(req.query.userId)
    accessUser.getUser(req.query.userId, databaseID, res);
});

router.options('/task/', cors());
router.post('/task/', cors(), function(req, res, next) {
  if(req.body.userId === "1"){
    res.json({message: 'reject'});
    return;
  }
  let databaseID = accessUser.checkUser(req.body.userId);
  if(databaseID < 0) {
    res.json({message: 'reject'});
  }
  else {
    communication.newEntry(req.body, res);
  }
});
router.get('/cards', cors(), function(req, res, next) {
  let databaseID = accessUser.checkUser(req.query.userId);
  if(databaseID < 0) {
    res.json({message: 'reject'});
  }
  else {
    // console.log("in all");
    communication.retrieveLatest10(req.query.userId, req.query.lastTime, res);
  }
});
//Retrieve all task
router.get('/alltask', cors(), function(req, res, next) {
  let databaseID = accessUser.checkUser(req.query.userId);
  if(databaseID < 0) {
    res.json({message: 'reject'});
  }
  else {
    // console.log("in all");
    communication.findByID(req.query.userId, res);
  }
});
//Retrieve task in Time
router.get('/task', cors(), function(req, res, next) {
  let databaseID = accessUser.checkUser(req.query.userId);
  if(databaseID < 0) {
    res.json({message: 'reject'});
  }
  else {
    // console.log("in time");
    communication.findByIDandTime(req.query.userId, req.query, res);
  }
});

module.exports = router;
