const express = require('express');
const routes = require('./routes'); 
const users = require("./routes/users");
const bodyParser = require('body-parser');

const mysql = require('mysql');
const connection = mysql.createConnection(require('./routes/keys.json').db);
const roles = require('./util/variables').roles;

const PORT = 3000;
const app = express();

app.use(bodyParser.json());

app.use((req,res,next)=>{
    if(req.query.role){
        req.role = parseInt(req.query.role);
        if(req.role){
            next();
        } else{
            res.status(401).send("Error in the query");
        }
    }else{
        next();
    }
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

app.get('/users',users.get);
app.put('/users/:id',(req,res,next)=>{
    if(req.role===roles.admin){
        
        res.status(204).end();
    }else{
        res.status(401).end();
    }
});

app.use((error,req,res,next)=>{
    console.log(error);
    res.status(500).end();
});

app.listen(PORT);

function log(m){
    if(typeof m === 'object') m = JSON.stringify(m);
    console.log(`\n\n\n${m}\n\n\n`);
}