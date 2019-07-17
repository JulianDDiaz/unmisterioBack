const mysql = require('mysql');
const connection = mysql.createConnection(require('./keys.json').db);const processStates = require('../util/variables').processStates;
const processStatesNames = require('../util/variables').processStatesNames;
const checkValues = require('../util/variables').checkValues;
const flow = require('../util/variables').flow;
const camundaMannager = require('../util/camunda');

//TODO: make it a promise
function userOwnsMobilityProcess(connection,req,next){
    connection.query(`select User_idUser from Mobility_Process where idMobility_Process="${req.params.id}"`,
    (error,results)=>{
        if(error) next(error);
        else{
            if(results[0].User_idUser==req.userId) return true;
            else return false;
        }
    });
};

module.exports.get = (req,res,next)=>{
    if((req.role==roles.student && true) || req.role==roles.ORI || 
        req.role==roles.admin){
            connection.query(`select * from Document_Support where Mobility_Process_id="${req.params.id}"`,
            (error,results)=>{
                if(error) next(error);
                else res.status(200).send(results);
            });
    }else{
        res.send(404).end();
    }
}

module.exports.post = (req,res,next)=>{
    let finished,errors;
    finished = 0;
    errors = [];
    if(true){
        for(support of req.body){
            connection.query(`insert into Document_Support values (null,"${support.document}","${support.idRequirement}","${req.params.id}")`,
            (error)=>{
                if(error){
                    errors.push(error);
                }
                finished++;
                if(finished==req.body.length){
                    if(errors.length>0){
                        next(errors);
                    }else{
                        connection.query(`update Mobility_Process set state="${processStatesNames[flow[processStates['Adjuntar soportes']][checkValues.Accepted]]}" where idMobility_Process="${req.params.id}"`);
                        camundaMannager.nextState(req.params.id,true);
                        res.status(201).end();
                    }
                }
            });
        }
    }else{
        res.status(401).end();
    }
};

module.exports.put = (req,res,next)=>{
    let finished,errors;
    finished = 0;
    errors = [];
    if(true){
        for(support of req.body){
            connection.query(`update Document_Support set document="${support.document}" where Mobility_Process_id="${req.params.id}" and idRequirement="${support.idRequirement}"`,
            (error)=>{
                if(error){
                    errors.push(error);
                }
                finished++;
                if(finished==req.body.length){
                    if(errors.length>0){
                        next(errors);
                    }else{
                        connection.query(`update Mobility_Process set state="${processStatesNames[flow[processStates['Adjuntar soportes']][checkValues.Accepted]]}" where idMobility_Process="${id}"`);
                        camundaMannager.nextState(req.params.id,true);
                        res.status(201).end();
                    }
                }
            });
        }
    }else{
        res.status(401).end();
    }
};