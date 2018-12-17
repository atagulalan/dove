let lectures = require("../data/lectures").lectures;

let returnText = "";
let returnLink = "";

Object.keys(lectures).map(el=>{
    returnText += "[\\[DRS\\] "+lectures[el].title+"]\n"
    returnLink += "[\\[DRS\\] "+lectures[el].title+"]:"+lectures[el].link+"\n"
})

exports.lectureLinks = returnText+"\n"+returnLink;