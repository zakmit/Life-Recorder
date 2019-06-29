const entry = require('../models/entry');
var express = require('express');

class communication {
    static newEntry(data, res) {       
        // console.log(data);
         
        const newEntry = new entry({
            user: data.userId,
            title: data.title,
            startTime: data.startTime,
            endTime: data.endTime,
            elapse: data.elapse,
            isPomodoro: data.isPomodoro,
            pattern: data.pattern
        })
        newEntry.save((error) => {
            if (error) {
            //   console.log(`Error has occurred: ${error}`);
              return res.json({message: error});
            }
            // console.log('Document is successfully saved.');
            res.json({message: 'finish'});
        });
    }
    static findByID(user, res) {        
        var quary = entry.find({user: user});
        return quary.exec(function (error, result) {
            if(error) {
              return console.log(`Error has occurred: ${error}`);
            }
            res.json(result);
        })
    }
    static retrieveLatest10(user, time, res) {
        let quary;
        if(time !== null)
            quary = entry.find({user: user,
                startTime: {
                    $lt: time
                }
            }).sort({startTime: -1}).limit(10);
        else{
            quary = entry.find({user: user,
            }).sort({startTime: -1}).limit(10);
        }
        return quary.exec(function (error, result) {
            console.log(result);
            
            if(error) {
              return console.log(`Error has occurred: ${error}`);
            }
            res.json(result);
        })
    }
    static findByIDandTime(user, data, res) {       
        console.log(data.startDate);
         
        var quary = entry.find({user: user,
            startTime: {
                $gte: data.startDate,
                $lt: data.endDate
            }
        });
        return quary.exec(function (error, result) {
            if(error) {
              return console.log(`Error has occurred: ${error}`);
            }
            res.json(result);
        })
    }
}

module.exports = communication;
