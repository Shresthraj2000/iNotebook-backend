const express = require("express");
const router = express.Router();
var fetchuser = require("../middleware/fetchuser");
const Notes = require("../models/Notes");
const { body, validationResult } = require('express-validator');


//ROUTE1: Get all notes from the user
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
  const notes = await Notes.find({ user: req.user.id });
  res.json(notes);
} catch (error) {
  console.error (error.message);
  res.status(500).send("Some error"); 
}
});



//ROUTE2: Add notes for a particular user
router.post('/addnote',fetchuser,[
    body("title", "title should be minimum 3chars").isLength({ min: 3 }),
    body("description", "desc should be minimum 5chars").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
    const { title, description, tag} = req.body;
    const note = new Notes({
      user: req.user.id, title, description, tag
    })
    const savenote = await note.save()
    res.json(savenote)
  } catch (error) {
    console.error (error.message);
    res.status(500).send("Some error"); 
}
});



//ROUTE3: Update an existing note
router.put('/updatenote/:id',fetchuser,
async (req, res) => {
  try {
  const { title, description, tag} = req.body;
  const newNote = {}
  if(title){
    newNote.title = title
  }
  if(description){
    newNote.description = description
  }
  if(tag){
    newNote.tag = tag
  }

  //Note is present or not
  const note = await Notes.findById(req.params.id)
  if(!note){
    return res.status(404).send("Note Not Found");
  }

  //user can update only his note
  if(note.user.toString()!==req.user.id /*middleware verified user*/ ){
    return res.status(401).send("Not allowed");
  }
  const updatenote = await Notes.findByIdAndUpdate(req.params.id,{$set: newNote}, {new: true})
  res.json(updatenote)

} catch (error) {
  console.error (error.message);
  res.status(500).send("Some error"); 
}
});



//ROUTE4: Delete an existing note
router.delete('/deletenote/:id',fetchuser,
async (req, res) => {
  try {
  //Note is present or not for deletion
  const note = await Notes.findById(req.params.id)
  if(!note){
    return res.status(404).send("Note Not Found");
  }

  //user can delete only his note
  if(note.user.toString()!==req.user.id /*middleware verified user*/ ){
    return res.status(401).send("Not allowed");
  }
  const deletenote = await Notes.findByIdAndDelete(req.params.id)
  res.json({"error": "Note Deleted", note: note})

} catch (error) {
  console.error (error.message);
  res.status(500).send("Some error"); 
}
});
module.exports = router;
