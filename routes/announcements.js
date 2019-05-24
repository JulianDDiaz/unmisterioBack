const mysql = require('mysql');
const connection = mysql.createConnection(require('./keys.json').db);

class Announcement{
    constructor(){
        this.idAnnouncement = null;
        this.name = null;
        this.description = null;
        this.Target_University_idTarget_University = null;
    }
}

module.exports.get = (req,res) => {
    let from,nRows,query;
    if(req.query.id){
        query = `SELECT * FROM Announcement WHERE idAnnouncement=${req.query.id}`;
    } else{
        if(req.query.from) from = req.query.from; else from = 0;
        if(req.query.nRows) nRows = req.query.nRows; else nRows = 10;  
        query = `SELECT * FROM Announcement limit ${from},${nRows}`;
    }
    connection.query(query, (error,results,fields)=>{
        let targetUniversities = "";
        for(let e in results) targetUniversities += `or idTarget_University = ${results[e].Target_University_idTarget_University} `;
        connection.query(`SELECT * FROM Target_University WHERE ${targetUniversities.substring(3,targetUniversities.length-1)}`, (error,resultsU,fields)=>{
            univInfo = {};
            for (let e in resultsU) univInfo[resultsU[e].idTarget_University] = resultsU[e];
            for (let e in results){
                results[e].targetUniversityInfo = univInfo[results[e].Target_University_idTarget_University];
                delete results[e].Target_University_idTarget_University;
            }
            res.status(200).send(results);
        });
    });
}

module.exports.post = (req,res)=>{
    let announcement = new Announcement();
    let values = "";
    for(a in announcement){
        if(req.body[a]) announcement[a] = req.body[a];
        values += '"'+announcement[a]+'",';
    }
    connection.query(`INSERT INTO Announcement VALUES (${values.substring(0,values.length-1)})`);
    res.status(201).end();
};

module.exports.put = (req,res)=>{
    let announcement = new Announcement();
    let set = "";
    for(a in announcement){
        if(req.body[a]) announcement[a] = req.body[a];
        set += `${a}='${announcement[a]}',`;
    }
    connection.query(`UPDATE Announcement SET ${set.substring(0,set.length-1)} WHERE idAnnouncement=${req.params.id}`);
    res.status(200).end();
};

module.exports.delete = (req,res)=>{
    connection.query(`DELETE FROM Announcement WHERE idAnnouncement=${req.params.id}`);
    res.status(204).end();
};