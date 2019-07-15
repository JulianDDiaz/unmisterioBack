const express = require('express');
const routes = require('./routes'); 
const users = require("./routes/users");
const mobilityProcesses = require("./routes/mobilityProcesses");
const requirementSupport = require("./routes/requirementSupports");
const bodyParser = require('body-parser');
const {OAuth2Client} = require('google-auth-library');
const cors = require('cors');

const { check, validationResult } = require('express-validator/check');

const mysql = require('mysql');
const connection = mysql.createConnection(require('./routes/keys.json').db);
const roles = require('./util/variables').roles;

const PORT = 3000;
const app = express();
const CLIENT_ID = '331350514407-s7lkqidvng629hv05efpqhidvrcqev3m.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

app.use(bodyParser.json());

app.use(cors());

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
    return ticket.getPayload();
}

app.use((req,res,next)=>{
    let token = req.header('googleToken');
    if(token){
        verify(token).catch(console.error).then((v)=>{
            connection.query(`select Role_idRole,idUser from User where mail="${v.email}"`,
            (error,results)=>{
                if(error) next(error);
                else if(results.length>0){
                    req.role=results[0].Role_idRole;
                    req.userId=results[0].idUser;
                    console.log("\n\n");
                    console.log(req.role);
                    console.log(req.userId);
                    console.log(token);
                    console.log("\n\n");
                    next();
                }
                else{
                    connection.query(`insert into User (Role_idRole,name,mail) values ("${roles.student}","${v.name}","${v.email}")`,
                    (error)=>{
                        if(error) next(error);
                        else{
                            connection.query(`select Role_idRole,idUser from User where mail="${v.email}"`,
                                (error,results)=>{
                                    if(error) next(error);
                                    else{
                                        req.role=results[0].Role_idRole;
                                        req.userId=results[0].idUser;
                                        console.log("\n\n");
                                        console.log(req.role);
                                        console.log(req.userId);
                                        console.log(token);
                                        console.log("\n\n");
                                        next();
                                    }
                                }
                            );
                        }
                    });
                }
            });
        });
    }else{
        next();
    }
});

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
    console.error(error);
    res.status(500).end();
});

app.listen(PORT);

function log(m){
    if(typeof m === 'object') m = JSON.stringify(m);
    console.log(`\n\n\n${m}\n\n\n`);
}
