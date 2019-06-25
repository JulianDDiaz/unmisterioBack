const mysql = require('mysql');
const connection = mysql.createConnection(require('./keys.json').db);

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

module.exports.post = (req,res,next)=>{
    
};