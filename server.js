const express = require('express');
const routes = require('./routes'); 
const bodyParser = require('body-parser');

const PORT = 3000;
const app = express();

app.use(bodyParser.json());

app.get('/targetUniversity',routes.targetUniversity.get);
app.post('/targetUniversity',routes.targetUniversity.post);
app.put('/targetUniversity',routes.targetUniversity.put);
app.delete('/targetUniversity',routes.targetUniversity.delete);

app.get('/announcements',routes.announcements.get);
app.post('/announcements',routes.announcements.post);
app.put('/announcements/:id',routes.announcements.put);
app.delete('/announcements/:id',routes.announcements.delete);

app.get('/mobilityProcesses',routes.mobilityProcess.get);

app.listen(PORT);