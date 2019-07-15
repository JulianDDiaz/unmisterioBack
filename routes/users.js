const mysql = require('mysql');
const connection = mysql.createConnection(require('./keys.json').db);
const roles = require('../util/variables').roles;

let user = ['carreer','birth','document_number','document_type','birth_place','gender','address','city','phone','cellphone','emergency_contact_name','emergency_contact_phone','emergency_contact_relationship','emergency_contact_email','emergency_contact_cellphone']

module.exports.get = (req,res,next)=>{
    if(req.role==roles.admin){
        let from,nRows;
        if(req.query.from) from = req.query.from; else from = 0;
        if(req.query.nRows) nRows = req.query.nRows; else nRows = 10; 
        connection.query(`SELECT idUser,Role_idRole,name,mail FROM User WHERE mail LIKE '${req.query.mail}%' LIMIT ${from}, ${nRows}`
            ,(error,results,fields)=>{
                if(error) next(error);
                res.status(200).send(results);
            }); 
    }else if(req.userId){
        connection.query(`SELECT * FROM User WHERE idUser=${req.userId}`,(error,results)=>{
            if(error) next(error);
            else res.status(200).send(results);
        });
    }else{
        res.status(401).end();
    }
};

module.exports.getById = (req,res,next)=>{
    if(req.role==roles.coordinator ||  req.role==roles.DRE || req.role==roles.admin){
        connection.query(`SELECT * FROM User WHERE idUser=${req.userId}`,(error,results)=>{
            if(error) next(error);
            else res.status(200).send(results);
        });
    }else{
        res.status(401).end();
    }
}

module.exports.put = (req,res,next)=>{
    if(req.userId){
        let query = "";
        for(i of user){
            if(req.body[i]){
                query += `,${i}="${req.body[i]}"`;
            }
        }
        connection.query(`update User set ${query.substring(1)} where idUser=${req.userId}`,
        (error)=>{
            if(error) next(error);
            else res.status(204).end();
        });
    }else{
        req.status(401).end();
    }
};

module.exports.putById = (req,res,next)=>{
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