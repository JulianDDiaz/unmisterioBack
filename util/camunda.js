var http = require('http');
var camunda = require('../routes/keys.json').camunda;

function getCamundaId(processData){
    var options = {
        host: camunda.host,
        port:8080,
        path:'/engine-rest/process-definition/key/'+camunda.key+'/start',
        method:'POST',
        headers: {
            'Content-Type': 'application/json',
          },
    };
    var response = new Promise((resolve,rejec) =>{
        var body =JSON.stringify({
            variables: {
                VB : {
                    value : "True",
                    type: "String"
                },
                idConvocatoria:{
                    value: processData.idConvocatoria,
                    type:"Integer"
                },
                convocatoria:{
                    value: processData.convocatoria,
                    type:"String"
                },
                correo:{
                    value: processData.correo,
                    type:"String"
                },
                nombre:{
                    value: processData.nombre,
                    type:"String"
                }
            }
        });
        var req = http.request(options,function(res){
            var data = "";
            res.on('data', function(chunk){
                data+=chunk;
            });
            res.on('end', function(){
                var process = JSON.parse(data);
                //console.log(process);
                resolve(process.id);
            });
        });
        req.write(body);
        req.end();
    });
    return response;
}
module.exports.getCamundaId = getCamundaId;

function getProcess(role){
    var options = {
        host:camunda.host,
        port:8080,
        path:'/engine-rest/task?assignee='+encodeURI(role),
        method:'GET',
        headers: {
            'Content-Type': 'application/json',
          },
    };
    var response = new Promise((resolve,rejec) =>{
        var req = http.request(options,function(res){
            var data = "";
            res.on('data', function(chunk){
                data+=chunk;
            });
            res.on('end', function(){
                var process = [];
                process = JSON.parse(data);
                //console.log(process);
                processID = [];
                for( var i =0;i < process.length;i++){
                    processID.push(process[i].processDefinitionId)
                }
                resolve(processID);
            });
        });
        req.end();
    });
    return response;
}
module.exports.getProcess = getProcess;

function getTask(idProcess){
    var options = {
        host:camunda.host,
        port:8080,
        path:'/engine-rest/task?processInstanceId='+idProcess,
        method:'GET',
        headers: {
            'Content-Type': 'application/json',
          },
    };
    var response = new Promise((resolve,rejec) =>{
        var req = http.request(options,function(res){
            var data = "";
            res.on('data', function(chunk){
                data+=chunk;
            });
            res.on('end', function(){
                var process = [];
                process = JSON.parse(data);
                resolve(process[0].id);
            });
        });
        req.end();
    });
    return response;
}

function nextState(idProcess,vb){
    getTask(idProcess).then((task)=> {
        //console.log(task);
        closeTask(task);
    });

}
module.exports.nextState = nextState;

function closeTask(task){
    var options = {
        host: camunda.host,
        port:8080,
        path:'/engine-rest/process-definition/task/'+task+'/complete',
        method:'POST',
        headers: {
            'Content-Type': 'application/json',
          },
    };
    
    var resp = new Promise((resolve,rejec) =>{
        var body =JSON.stringify({
            variables: {
                VB : {
                    value : "Test de cierre 2 ",
                    type: "String"
                },
                idConvocatoria:{
                    value: 44,
                    type:"Integer"
                },
                convocatoria:{
                    value: "hola",
                    type:"String"
                },
                correo:{
                    value: "processData@correo",
                    type:"String"
                },
                nombre:{
                    value: "maunel",
                    type:"String"
                }
            }
        });
        var req = http.request(options,function(res){
            var data = "";
            res.on('data', function(chunk){
                data+=chunk;
            });
            res.on('end', function(){
                console.log("request done");
                resolve(data);
            });
        });
        req.write(body);
        req.end();

    });
    return resp;
}


// testing ...
pd = {
    idConvocatoria:15616,
    convocatoria:'Inglaterra- carreras de maestria en IA',
    correo: 'roasarmientoga@unal.edu.co',
    nombre: 'Ronald Sarmiento',
}

/* var res = getCamundaId(pd);
res.then((id)=>{
    console.log(id);
}) */

/* getProcess().then((ids)=>{
    ids.forEach(element => {
        console.log(element);
    });
}); */

/* getTask('2b669eb8-a5c0-11e9-b3c9-005056c00008').then((res)=> {
    console.log(res);
}); */
closeTask('ed6d3c7c-a6ae-11e9-88b6-0242a13254d6').then(
    res =>{
        console.log(res);
    }
);
//*nextState('2b669eb8-a5c0-11e9-b3c9-005056c00008',true);
