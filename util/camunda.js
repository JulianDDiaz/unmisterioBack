var http = require('http');


function getCamundaId(processData){
    var options = {
        host:'127.0.0.1',
        port:8080,
        path:'/engine-rest/process-definition/key/Process_13052019/start',
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


function getProcess(){
    var options = {
        host:'127.0.0.1',
        port:8080,
        path:'/engine-rest/process-instance?processDefinitionKey=Process_13052019',
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
                    processID.push(process[i].id)
                }
                resolve(processID);
            });
        });
        req.end();
    });
    return response;
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

getProcess().then((ids)=>{
    ids.forEach(element => {
        console.log(element);
    });
});

//endTask(task);