const mysql = require('mysql');
const connection = mysql.createConnection(require('./keys.json').db);

module.exports.get = (req,res) => {
    let query;
    if(req.query.id){
        query = `SELECT * FROM Mobility_Process WHERE idMobility_Process=${req.query.id}`;
    }else{
        var from,nRows;
        if(req.query.from) from = req.query.from; else from = 0;
        if(req.query.nRows) nRows = req.query.nRows; else nRows = 10;
        query = `SELECT * FROM Mobility_Process limit ${from},${nRows}`;
    }
    connection.query(query, (error,results,fields)=>{
        res.status(200).send(results);
    });
}