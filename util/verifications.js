module.exports.userOwnsMobilityProcess = (connection,req,next)=>{
    connection.query(`select User_idUser from Mobility_Process where idMobility_Process=${req.params.id}`,
    (error,results)=>{
        if(error) next(error);
        else{
            if(results[0].User_idUser==req.userId) return true;
            else return false;
        }
    });
};