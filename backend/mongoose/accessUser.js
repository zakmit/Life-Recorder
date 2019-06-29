const user = require('../models/user');
var express = require('express');

class accessUser {
    static newUser(userId, databaseID) {                
        const newEntry = new user({
            user: userId,
            databaseID: databaseID
        })
        newEntry.save((error) => {
            if (error) {
              console.log(`Error has occurred: ${error}`);
              return res.json({message: error});
            }
            console.log('Document is successfully saved.');
        });
    }
    static changeUserPref(userID, data, res) {
        var query = {'user': userID};
        if(data.themeName !== null || data.pomoMinutes !== null) {
            if(data.themeName != null)
                user.findOneAndUpdate(query, { themeName: data.themeName }, {useFindAndModify: false}, function(err, doc){
                    if (err) return res.send(500, { error: err });
                    return res.send("succesfully saved");
                })
            if(data.pomoMinutes != null)
                user.findOneAndUpdate(query, { pomoMinutes: parseInt(data.pomoMinutes) }, {useFindAndModify: false}, function(err, doc){
                    if (err) return res.send(500, { error: err });
                    return res.send("succesfully saved");
                })
            if(data.showHours != null) {
                console.log(data.showHours);
                user.findOneAndUpdate(query, { showHours: data.showHours }, {useFindAndModify: false}, function(err, doc){
                    if (err) return res.send(500, { error: err });
                    return res.send("succesfully saved");
                })
            }
        }
    }
    static getUser(userID, databaseID, res) {
        var quary = user.find({user: userID});
        return quary.exec(function (error, result) {
            if(error) {
                res.json({message: 'reject'});
                return console.log(`Error has occurred: ${error}`);
            }
            if(result.length > 1) {
                res.json({message: 'reject'});
                return console.log(`more than 1 user with same uID`);

            }
            if(result.length == 0) {
                res.json({message: 'error, no user'});
            }
            else {
                res.json({message: 'approve', user: result});
            }
            // check userindatabase with given
            return;
        })
    }
    static signUser(userID, databaseID, res) {
        var quary = user.find({user: userID});
        return quary.exec(function (error, result) {
            if(error) {
                res.json({message: 'reject'});
                return console.log(`Error has occurred: ${error}`);
            }
            if(result.length > 1) {
                res.json({message: 'reject'});
                return console.log(`more than 1 user with same uID`);

            }
            if(result.length == 0) {
                accessUser.newUser(userID, databaseID);
                res.json({message: 'create'});
            }
            else {
                res.json({message: 'approve'});
            }
            // check userindatabase with given
            return;
        })
    }
    static checkUser(userID) {
        var quary = user.find({user: userID});
        return quary.exec(function (error, result) {
            if(error) {
              return console.log(`Error has occurred: ${error}`);
            }
            if(result.length > 1) {
                // console.log(`more than 1 user with same uID`);
                return -1;

            }
            if(result.length == 0) {
                // console.log("result.length = 0");
                // console.log(`user not found`);
                return -1;
            }
            else {
                // console.log('approve, found user');
                return result[0].databaseID;
            }
        })
    }
}

module.exports = accessUser;
