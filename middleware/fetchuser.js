var jwt = require('jsonwebtoken');
const JWT_TOKKEN = 'shresthisgood'; //secret token

const fetchuser = (req,res,next)=>{
    //get the user from the jwt token and add id to req object
    const token = req.header('auth_token');
    if(!token){
        res.status(401).send({error: "Please provide valid token"})
    } 
    try {
        const data = jwt.verify(token,JWT_TOKKEN);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({error: "Please provide valid token"})
    }
}

module.exports = fetchuser;