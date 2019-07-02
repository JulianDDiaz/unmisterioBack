const mysql = require('mysql');
const connection = mysql.createConnection(require('./keys.json').db);
const { check, validationResult } = require('express-validator/check');
const roles = require('../util/variables').roles;

const mobilityProcess = {
    idAnnouncement : null,
    un_location : null,
    un_faculty : null,
    un_curricular_program : null,
    papa : null,
    un_curricular_coordinator_name : null,
    un_curricular_coordinator_phone : null,
    un_curricular_coordinator_email : null,
    target_city : null,
    target_faculty : null,
    target_curricular_program : null,
    modality : null
};

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

function getCamundaId(){
    return new String(parseInt(Math.random()*10000));
};

module.exports.post = (req,res,next)=>{
    if(req.body.idAnnouncement){
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        let b = req.body;
        let currentDate = new Date().toISOString().substring(0,10);
        for (e in mobilityProcess){
            if(b[e]){
                b[e] = `"${b[e]}"`;
            } else{
                b[e] = null;
            }
        }
        connection.query(
            `INSERT INTO Mobility_Process VALUES ("${getCamundaId()}",1,"${currentDate}",${b.idAnnouncement},"${currentDate}",${req.userId},${b.un_location},${b.un_faculty},${b.un_curricular_program},${b.papa},${b.un_curricular_coordinator_name},${b.un_curricular_coordinator_phone},${b.un_curricular_coordinator_email},${b.target_city},${b.target_faculty},${b.target_curricular_program},${b.modality})`
            ,(error) => {if(error) next(error);}
        )
        res.status(201).end();
    }else{
        res.status(400).end();
    }
};

function update(b,id,res,next){
    let query = "";
    for (e in mobilityProcess){
        if(b[e]){
            query += `,${e}="${b[e]}"`;
        }
    }
    connection.query(`update Mobility_Process set ${query.substring(1)} where idMobility_Process="${id}"`,
    (error)=>{
        if(error){
            next(error);
        }else{
            res.status(204).end();
        }
    });
};

module.exports.put = (req,res,next)=>{
    if(req.role){
        if(req.role==roles.admin || req.role==roles.coordinator){
            update(req.body,req.params.id,res,next);
        }else{
            connection.query(`select User_idUser from Mobility_Process where idMobility_Process="${req.params.id}"`,
            (error,results)=>{
                if(error){
                    next(error);
                }else{
                    if(results[0].User_idUser==req.userId){
                        update(req.body,req.params.id,res,next);
                    }else{
                        res.status(401).end();
                    }
                }
            });
        }
    }else{
        res.status(401).end();
    }
};

module.exports.sanitize = [
    check('idAnnouncement').optional().isInt(),
    check('un_location').optional().isString(),
    check('un_faculty').optional().isString(),
    check('un_curricular_program').optional().isString(),
    check('papa').optional().isDecimal(),
    check('un_curricular_coordinator_name').optional().isString(),
    check('un_curricular_coordinator_phone').optional().isString(),
    check('un_curricular_coordinator_email').optional().isEmail(),
    check('target_city').optional().isString(),
    check('target_faculty').optional().isString(),
    check('target_curricular_program').optional().isString(),
    check('modality').optional().isString()
];