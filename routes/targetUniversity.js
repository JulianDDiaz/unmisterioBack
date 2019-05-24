const mysql = require('mysql');
const connection = mysql.createConnection(require('./keys.json').db);

class Announcement{
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
    let announcement = new Announcement();
    for(a in announcement){
        if(req.body[a]) announcement[a] = req.body[a];
    }
    connection.query(`INSERT INTO Target_University VALUES (${announcement.idTarget_University},'${announcement.name}','${announcement.description}')`);
    res.status(201).end();
};

module.exports.put = (req,res)=>{
    let announcement = new Announcement();
    let set = "";
    for(a in announcement){
        if(req.body[a]) announcement[a] = req.body[a];
        set += `${a}='${announcement[a]}',`;
    }
    connection.query(`UPDATE Target_University SET ${set.substring(0,set.length-1)} WHERE idTarget_University=${req.query.id}`);
    res.status(200).end();
};

module.exports.delete = (req,res)=>{
    connection.query(`DELETE FROM Target_University WHERE idTarget_University=${req.query.id}`);
    res.status(204).end();
};