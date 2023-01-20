const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_TOKKEN = 'shresthisgood'; //secret token

//ROUTE1: create user using post 
router.post('/createuser',[
  body('name',"length should be minimum 3chars").isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 3 }),
] , async (req,res) => {
  // obj = {
  //   a: "raj",
  //   num: 35,
  // };
  // res.json(obj);  
  // console.log(req.body)
  // const user = User( req.body)
  // user.save()
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  //check whether email alreday exists 
  try{
    let user = await User.findOne({email: req.body.email});
    if(user){
      return res.status(400).json({error: "Sorry email already exists"})
    } 
  
  //hashing password
  const salt = await bcrypt.genSalt(10)
  const secPass = await bcrypt.hash(req.body.password,salt)
  
  //create a new user
  user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: secPass,
  })

  //jwt token for auth
  const data =  {
    user:{
      id: user.id
    }
  }
  const authtoken = jwt.sign(data,JWT_TOKKEN);
  res.json({authtoken})
  } catch(error){
  console.error (error.message);
  res.status(500).send("Some error");
}
});




//ROUTE2: login user using post
router.post('/login',[
  body('email').isEmail(),
  body('password').exists(),
] ,async (req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const {email,password} = req.body;
  try{
    //email not present in db
    let user = await User.findOne({email});
    if(!user){
      return res.status(400).json({error: "Sorry bad credentials"})
    } 
    // decrypt and compare password
    let authuser = await bcrypt.compare(password,user.password);
    if(!authuser){
      return res.status(400).json({error: "Sorry bad credentials"})
    }
    
    //
    const payload =  {
      user:{
        id: user.id
      }
    }
    const authtoken = jwt.sign(payload,JWT_TOKKEN);
    res.json({authtoken})

  } catch(error){
    console.error (error.message);
    res.status(500).send("Some error");
  }
})




//ROUTE3: get loggedin user details
router.post('/getuser', fetchuser  /*middleware*/ , async(req,res)=>{
  try {
    const userid= req.user.id
    const user = await User.findById(userid).select("-password")  //fetch everything except password
    res.send(user)
  } catch (error) {
    console.error (error.message);
    res.status(500).send("Some error");
  }
})

module.exports = router;
