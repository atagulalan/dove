let posts = require("../data/posts").posts;

let returnText = "";
let returnLink = "";

Object.keys(posts).map(el=>{
    returnText += "[\\["+posts[el].category+"\\] "+posts[el].title+"]\n"
    returnLink += "[\\["+posts[el].category+"\\] "+posts[el].title+"]:"+posts[el].link+"\n"
})

exports.postLinks = returnText+"\n"+returnLink;