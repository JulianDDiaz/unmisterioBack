const mysql = require('mysql');
const connection = mysql.createConnection(require('./keys.json').db);
const roles = require('../util/variables').roles;

module.exports.get = (req,res,next)=>{
    let from,nRows;
    if(req.query.from) from = req.query.from; else from = 0;
    if(req.query.nRows) nRows = req.query.nRows; else nRows = 10; 
    connection.query(`SELECT idUser,Role_idRole,name,mail FROM User WHERE mail LIKE '${req.query.mail}%' LIMIT ${from}, ${nRows}`
        ,(error,results,fields)=>{
            if(error) next(error);
            res.status(200).send(results);
        }); 
};

module.exports.put = (req,res,next)=>{
    if(req.body.role){
        if(req.role===roles.admin){
            connection.query(`update User set Role_idRole=${req.body.role} where idUser=${req.params.id}`,
            (error)=>{
                if(error) next(error);
                res.status(204).end();
            });
        }else{
            res.status(401).end();
        }
    }else{
        res.status(400).end();
    }
};