const mysql = require('mysql');
const connection = mysql.createConnection(require('./keys.json').db);
const { check, validationResult } = require('express-validator/check');
const roles = require('../util/variables').roles;
const processStates = require('../util/variables').processStates;
const processStatesNames = require('../util/variables').processStatesNames;
const checkValues = require('../util/variables').checkValues;
const flow = require('../util/variables').flow;
const camundaMannager = require('../util/camunda');

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

module.exports.get = (req,res,next) => {
    let from,nRows;
    if(req.query.from) from = req.query.from; else from = 0;
    if(req.query.nRows) nRows = req.query.nRows; else nRows = 10;
    if(req.query.mail){
        if(role==roles.coordinator || role==roles.committee || role==roles.ORI || role==roles.DRE){
            let userId = 0;
            connection.query(`select idUser from User where mail='${req.params.email}%'`,
            (error,results)=>{
                if(error) next(error);
                else{
                    let userId = results[0].idUser;
                    connection.query(`select Mobility_Process.idMobility_Process,Mobility_Process.state,Mobility_Process.idAnnouncement,Announcement.name,Announcement.description inner join Announcement on Mobility_Process.idAnnouncement=Announcement.idAnnouncement where User_idUser=${userId}`,
                        (error,results)=>{
                            if(error) next(error);
                            else res.status(200).send(results);
                        }
                    );
                }
            });
        }else{
            res.status(401).end();
        }
    }else{
        if(req.role==roles.student){
            connection.query(`select Mobility_Process.idMobility_Process,Mobility_Process.state,Mobility_Process.lastChange,Announcement.description,Announcement.name from Mobility_Process inner join Announcement on Mobility_Process.idAnnouncement=Announcement.idAnnouncement where Mobility_Process.User_idUser=${req.userId}`,
            (error,results)=>{
                if(error) next(error);
                else res.status(200).send(results);
            });
        }else if(req.role==roles.DRE){
            connection.query(`select idAnnouncement from Announcement where closureDate<"${new Date().toISOString().substring(0,10)}" and state="Abierta"`,
            (error,results)=>{
                if(error) console.log(error);
                else{
                    if(results.length>0){
                        let aux;
                        for(r of results){
                            aux = `or idAnnouncement=${r.idAnnouncement} `;
                        }
                        connection.query(`update Mobility_Process set state="Proceso caducó" where (${aux.substring(3)}) and (state="Revisión de formulario" or state="Corrección de formulario" or state="Adjuntar soportes" or state="Revisión asignaturas" or state="Revisión requisitos")`,
                        (error)=>{
                            if(error) console.log(error);
                            else{
                                connection.query(`update Announcement set state="Cerrada" where ${aux.substring(3)}`,
                                (error)=>{
                                    if(error) console.log(error);
                                    camundaMannager.getProcess("DRE").catch((error)=>next(error))
                                    .then((processes)=>{
                                        res.status(201).send(processes);
                                    });
                                });
                            }
                        });
                    }
                }
            });
        }else{
            let camundaRole = "";
            if(req.role==roles.coordinator) camundaRole = "Coordinador curricular";
            else if(req.role==roles.committee) camundaRole = "Comité de programas curriculares";
            else if(req.role==roles.ORI) camundaRole = "ORI";
            if(camundaRole=="") res.status(401).end();
            else{
                camundaMannager.getProcess(camundaRole).catch((error)=>next(error))
                .then((processes)=>{
                    processes = JSON.parse(processes);
                    if(processes.length>0){
                        query = "";
                        for(p of processes){
                            query += `or idMobility_Process="${p.executionId}"`;
                        }
                        connection.query(`select * from Mobility_Process inner join User on Mobility_Process.User_idUser=User.idUser where ${query.substring(3)}`,
                        (error,results)=>{
                            if(error) next(error);
                            else{
                                res.status(201).send(results);
                            }
                        });
                    }
                    else res.status(201).send(processes);
                });
            }
        }
    }
}

module.exports.getByAnnouncementId = (req,res,next)=>{
    let from,nRows,filter;
    if(req.query.from) from = req.query.from; else from = 0;
    if(req.query.nRows) nRows = req.query.nRows; else nRows = 10;
    switch(req.role){
        case roles.coordinator:
            filter="Revisión formulario"
    }
    
}

module.exports.post = (req,res,next)=>{
    if(req.body.idAnnouncement && req.userId){
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
        let camundaData = {};
        connection.query(`select name,mail from User where idUser=${req.userId}`,
        (error,results)=>{
            if(error) next(error);
            else{
                camundaData.correo = results[0].mail;
                camundaData.nombre = results[0].name;
                connection.query(`select name from Announcement where idAnnouncement=${req.body.idAnnouncement}`,
                (error,results)=>{
                    if(error) next(error);
                    else{
                        camundaData.convocatoria = results[0].name;
                        camundaData.idConvocatoria = req.body.idAnnouncement;
                        camundaMannager.getCamundaId(camundaData).catch((error)=>next(error)).then((processId)=>{
                            connection.query(
                                `INSERT INTO Mobility_Process VALUES ("${processId}","Revisión de formulario","${currentDate}",${b.idAnnouncement},"${currentDate}",${req.userId},${b.un_location},${b.un_faculty},${b.un_curricular_program},${b.papa},${b.un_curricular_coordinator_name},${b.un_curricular_coordinator_phone},${b.un_curricular_coordinator_email},${b.target_city},${b.target_faculty},${b.target_curricular_program},${b.modality})`
                                ,(error) => {
                                    if(error) next(error);
                                    else {
                                        camundaMannager.nextState(processId,true);
                                        res.status(204).end();
                                    }
                                }
                            );
                        });
                    }
                });
            }
        });
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
    connection.query(`update Mobility_Process set ${query.substring(1)},lastChange="${new Date().toISOString().substring(0,10)}" where idMobility_Process="${id}"`,
    (error)=>{
        if(error){
            next(error);
        }else{
            connection.query(`update Mobility_Process set state="${processStatesNames[flow[1][checkValues.Accepted]]}" where idMobility_Process="${id}"`,(error)=>{
                if (error) next(error);
                else {
                    camundaMannager.nextState(processId,true);
                    res.status(204).end();
                }
            });
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
                    if(results==true){
                        if(results[0].User_idUser==req.userId){
                            update(req.body,req.params.id,res,next);
                        }else{
                            res.status(401).end();
                        }
                    }else{
                        res.status(400).send(`mobility process "${req.params.id}" does not exist`);
                    }
                }
            });
        }
    }else{
        res.status(401).end();
    }
};

const isAthorized = (role,state)=>{
    let authorized = false;
    switch(state){
        case 0:
            if(role==roles.coordinator) authorized = true;
            break;
        case 4:
            if(role==roles.committee) authorized = true;
            break;
        case 5:
            if(role==roles.ORI) authorized = true;
            break;
        case 6:
            if(role==roles.DRE) authorized = true;
            break;
        case 7:
            if(role==roles.DRE) authorized = true;
            break;
        case 8:
            if(role==roles.DRE) authorized = true;
            break;
    }
    return authorized;
}

module.exports.patch = (req,res,next)=>{
    if(req.body.check=='Rejected' || req.body.check=='Accepted'){
        connection.query(`select state from Mobility_Process where idMobility_Process="${req.params.id}"`,
        (error,results)=>{
            if(error) next(error);
            else{
                state = processStates[results[0].state];
                if(isAthorized(req.role,state)){
                    connection.query(`update Mobility_Process set state="${processStatesNames[flow[state][checkValues[req.body.check]]]}" where idMobility_Process="${req.params.id}"`,
                    (error)=>{
                        if(error) next(error);
                        else {
                            console.log(req.params.id);
                            camundaMannager.nextState(req.params.id,req.body.check=='Accepted');
                            res.status(204).end()
                        }
                    });
                }else{
                    res.status(401).end();
                }
            }
        });
    }else{
        res.status(400).end();
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