const mysql = require('mysql');
const connection = mysql.createConnection(require('./keys.json').db);

class TargetUniversity{
    constructor(){
        this.idTarget_University = null;
        this.name = null;
        this.description = null;
    }
}

module.exports.get = (req,res) => {
    let from,nRows;
    if(req.query.from) from = req.query.from; else from = 0;
    if(req.query.nRows) nRows = req.query.nRows; else nRows = 10;
    connection.query(`SELECT * FROM Target_University limit ${from},${nRows}`, (error,results,fields)=>{
        res.status(200).send(results);
    });
    console.log('GET')
}

module.exports.post = (req,res)=>{
    let targetUniversity = new TargetUniversity();
    for(a in targetUniversity){
        if(req.body[a]) targetUniversity[a] = req.body[a];
    }
    connection.query(`INSERT INTO Target_University VALUES (${targetUniversity.idTarget_University},'${targetUniversity.name}','${targetUniversity.description}')`);
    res.status(201).end();
};

module.exports.put = (req,res)=>{
    let targetUniversity = new TargetUniversity();
    let set = "";
    for(a in targetUniversity){
        if(req.body[a]) targetUniversity[a] = req.body[a];
        set += `${a}='${targetUniversity[a]}',`;
    }
    connection.query(`UPDATE Target_University SET ${set.substring(0,set.length-1)} WHERE idTarget_University=${req.query.id}`);
    res.status(200).end();
};

module.exports.delete = (req,res)=>{
    connection.query(`DELETE FROM Target_University WHERE idTarget_University=${req.query.id}`);
    res.status(204).end();
};