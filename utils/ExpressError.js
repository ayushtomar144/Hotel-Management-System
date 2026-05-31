class ExpressError extends Error{
    constructor(statuscode,message){
        this.statuscode=statuscode;
        this.message=message;
    }
}
module.exports=ExpressError;