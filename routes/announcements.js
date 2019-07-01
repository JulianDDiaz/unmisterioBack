const mysql = require('mysql');
const targetUniversity = require('./targetUniversity');
const connection = mysql.createConnection(require('./keys.json').db);

class Announcement{
    constructor(){
        this.idAnnouncement = null;
        this.name = null;
        this.description = null;
        this.idTargetUniversity = null;
        this.vacant = null;
        this.releaseDate = null;
        this.closureDate = null;
        this.limitDate = null;
        this.state = null;
        this.image = null;
        this.target_un_contact_name = null;
        this.target_un_contact_position = null;
        this.target_un_contact_email = null;
        this.target_un_contact_phone = null;
    }
}

class Requirement{
    constructor(){
        this.idRequirement = null;
        this.description = null;
        this.name = null;
    }
}

module.exports.get = (req,res,next) => {
    let from,nRows;
    if(req.query.from) from = req.query.from; else from = 0;
    if(req.query.nRows) nRows = req.query.nRows; else nRows = 10; 
    connection.query(`select Announcement.idAnnouncement, Announcement.name, Announcement.description, Announcement.vacant, Announcement.releaseDate, Announcement.closureDate, Announcement.idTargetUniversity, Announcement.closureDate, Announcement.limitDate, Announcement.state, Announcement.image, Target_University.name as universityName, Target_University.description as universityDescription from Announcement inner join Target_University on Announcement.idTargetUniversity=Target_University.idTarget_University limit ${from}, ${nRows}`
        ,(error,results,fields)=>{
            if(error) next(error);
            res.status(200).send(results);
    });
}

module.exports.getById = (req,res,next)=>{
    connection.query(`SELECT * FROM Announcement WHERE idAnnouncement=${req.params.id}`,
    (error,results)=>{
        let response = results[0];
        if(error) next(error);
        connection.query(`SELECT * FROM Requirement WHERE idAnnouncement=${req.params.id}`,(error,results)=>{
            if(error) next(error);
            response.requirements = results
            res.status(200).send(response);
        });
    });
};

module.exports.post = (req,res,next)=>{
    if(req.body['requirements']){
        let announcement = new Announcement();
        let values = "";
        for(a in announcement){
            if(req.body[a]) announcement[a] = req.body[a];
            values += '"'+announcement[a]+'",';
        }
        connection.query(`INSERT INTO Announcement VALUES (${values.substring(0,values.length-1)})`,
            (error)=>next(error));
        values = "";
        for(r of req.body.requirements){
            requirement = new Requirement();
            values += '(';
            requirement.idAnnouncement = announcement.idAnnouncement;
            for(e in requirement){
                if(r[e]) requirement[e] = r[e];
                values += '"'+requirement[e]+'",';
            }
            values = values.substring(0,values.length-1);
            values += '),';
        }
        values = values.substring(0,values.length-1);
        console.log(`\nINSERT INTO Requirement VALUES ${values}\n`);
        connection.query(`INSERT INTO Requirement VALUES ${values}`,(error)=>{
            next(error);
        });
        res.status(201).end();
    }else{
        res.status(400).end();
    }
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