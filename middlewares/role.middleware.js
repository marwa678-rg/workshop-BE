
function  roleMiddleWare(...roles){

  return(request,response,next)=>{
    const userRole = request.user.role;
    if(!userRole){
      return response.response.status(403).json({message:"un authorized"})
    }
const isExist = roles.includes(userRole);
if(!isExist){
  return 
}

next();
  }
}
module.exports= {roleMiddleWare};