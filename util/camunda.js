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
                    value : true,
                    type: "Boolean"
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

function getProcessVariables(idProcess){
    let resp = new Promise((resolve,reject) =>{
        var options = {
            host:camunda.host,
            port:8080,
            path:'/engine-rest/process-instance/'+idProcess+'/variables',
            method:'GET',
            headers: {
                'Content-Type': 'application/json',
              },
        };
        var req = http.request(options,function(res){
            var data = "";
            res.on('data', function(chunk){
                data+=chunk;
            });
            res.on('end', function(){
                let variables = JSON.parse(data);
                resolve(variables);
            });
        });
        req.end();
 
    });
    return resp;
}

function getProcesses(role){
    var options = {
        host:camunda.host,
        port:8080,
        path:'/engine-rest/task?assignee='+encodeURI(role),
        path:'/engine-rest/task?assignee='+encodeURI(role)+'&processDefinitionKey='+camunda.key,
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
                resolve(data);
            });
        });
        req.end();
    });
    return response;
}


function getProcess(role){
    let dataProcess = new Promise((resolve,reject) => {

        getProcessID(role).then((ids)=>{
            let rs = new Promise((resolve,reject)=>{
                let completeTaskArray =[];
                let len=0;
                for (let i = 0; i < ids.length; i++) {
                    getProcessVariables(ids[i]).then((taskVar) =>{
                        //console.log(taskVar);
                        completeTaskArray.push(taskVar);
                        len+=1;
                    });
                }
                while(len < ids.length){
                    console.log(len);
                    
                }
                resolve(completeTaskArray);
                
            });
            return rs;
            
        }).then((data)=>{
                resolve(data)
            }  
        );
    });
    return dataProcess;
}
function getProcessID(role){ // returns a process ids array of the given role 
    var options = {
        host:camunda.host,
        port:8080,
        path:'/engine-rest/task?assignee='+encodeURI(role)+'&processDefinitionKey='+camunda.key,
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
                processID = [];
                for( var i =0;i < process.length;i++){
                    processID.push(process[i].processInstanceId)
                }
                resolve(processID);
            });
        });
        req.end();
    });
    return response;
}
module.exports.getProcess = getProcesses;

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
        closeTask(task,vb);
    });

}
module.exports.nextState = nextState;

function closeTask(task,vb){
    var options = {
        host: camunda.host,
        port:8080,
        path:'/engine-rest/task/'+task+'/complete',
        method:'POST',
        headers: {
            'Content-Type': 'application/json',
          },
    };
    
    var resp = new Promise((resolve,rejec) =>{
        var body =JSON.stringify({
            variables: {
                VB : {
                    value : vb
                }
            }
        });
        var req = http.request(options,function(res){
            var data = "";
            res.on('data', function(chunk){
                data+=chunk;
            });
            res.on('end', function(){
                resolve(data);
            });
            if(res.statusCode != 202){
                console.error(res.statusMessage);
            }
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
/* getProcess("Estudiante").then(
    (data) =>{
        console.log(data);
    }
); */

/* getTask('2b669eb8-a5c0-11e9-b3c9-005056c00008').then((res)=> {
    console.log(res);
}); */
/* closeTask('ed6d3c7c-a6ae-11e9-88b6-0242a13254d6').then(
    res =>{
        //console.log(res);
    }
);*/
//nextState('2817db59-a7fc-11e9-88b6-0242a13254d6',true);
