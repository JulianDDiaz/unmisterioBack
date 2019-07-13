const express = require('express');
const routes = require('./routes'); 
const users = require("./routes/users");
const mobilityProcesses = require("./routes/mobilityProcesses");
const requirementSupport = require("./routes/requirementSupports");
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
app.post('/mobilityProcesses',mobilityProcesses.sanitize,mobilityProcesses.post);
app.put('/mobilityProcesses/:id',mobilityProcesses.sanitize,mobilityProcesses.put);
app.patch('/mobilityProcesses/:id',mobilityProcesses.patch);

app.get('/requirementSupports/:id',requirementSupport.get);
app.post('/requirementSupports/:id',requirementSupport.post);
app.put('/requirementSupports/:id',requirementSupport.put);

app.get('/users',users.get);
app.get('/users/:id',users.getById);
app.put('/users',users.put);
app.put('/users/:id',users.putById);

app.use((error,req,res,next)=>{
    console.log(error);
    res.status(500).end();
});

app.listen(PORT);

function log(m){
    if(typeof m === 'object') m = JSON.stringify(m);
    console.log(`\n\n\n${m}\n\n\n`);
}