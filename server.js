const express = require('express');
const routes = require('./routes'); 
const users = require("./routes/users");
const bodyParser = require('body-parser');

const { check, validationResult } = require('express-validator/check');

const mysql = require('mysql');
const connection = mysql.createConnection(require('./routes/keys.json').db);
const roles = require('./util/variables').roles;

const PORT = 3000;
const app = express();

app.use(bodyParser.json());

app.use((req,res,next)=>{
    if(req.query.role){
        req.role = parseInt(req.query.role);
        if(!req.role){
            res.status(401).send("Error in the query");
        }
    }
    if(req.query.user){
        req.userId = parseInt(req.query.user);
        if(!req.userId){
            res.status(401).send("Error in the query");
        }
    }
    next();
});

app.get('/targetUniversity',routes.targetUniversity.get);
app.post('/targetUniversity',routes.targetUniversity.post);
app.put('/targetUniversity',routes.targetUniversity.put);
app.delete('/targetUniversity',routes.targetUniversity.delete);

app.get('/announcements',routes.announcements.get);
app.get('/announcements/:id',routes.announcements.getById);
app.post('/announcements',routes.announcements.post);
app.put('/announcements/:id',routes.announcements.put);
app.delete('/announcements/:id',routes.announcements.delete);

app.get('/mobilityProcesses',routes.mobilityProcess.get);

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
}
sanitize = [
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
function getCamundaId(){
    return new String(parseInt(Math.random()*10000));
}
app.post('/mobilityProcesses',sanitize,(req,res,next)=>{
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
});

app.get('/users',users.get);
app.put('/users/:id',users.put);

app.use((error,req,res,next)=>{
    console.log(error);
    res.status(500).end();
});

app.listen(PORT);

function log(m){
    if(typeof m === 'object') m = JSON.stringify(m);
    console.log(`\n\n\n${m}\n\n\n`);
}