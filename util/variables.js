const roles = {
    student : 1,
    coordinator: 2,
    committee : 3,
    ORI : 4,
    DRE : 5,
    admin : 6
}
module.exports.roles = roles;
const checkValues = {'Rejected' : 0, 'Accepted' : 1};
module.exports.checkValues = checkValues;
const processStates = {
    'Revisión de formulario' : 0,
    'Corrección de formulario' : 1,
    'Proceso caducó' : 2,
    'Adjuntar soportes' : 3,
    'Revisión asignaturas' : 4,
    'Revisión requisitos' : 5,
    'Comité seleccionador' : 6,
    'En espera de aprobación por parte de destino' : 7,
    'Proceso aprobado' : 8,
    'Proceso descartado' : 9
}
module.exports.processStates = processStates;
const processStatesNames = ['Revisión de formulario',
'Corrección de formulario',
'Proceso caducó',
'Adjuntar soportes',
'Revisión asignaturas',
'Revisión requisitos',
'Comité seleccionador',
'En espera de aprobación por parte de destino',
'Proceso aprobado',
'Proceso descartado'];
module.exports.processStatesNames = processStatesNames;
const flow = [
    [1,3],
    [2,0],
    [],
    [2,4],
    [0,5],
    [2,6],
    [9,7],
    [9,8],
    [],
    []
];
module.exports.flow = flow;