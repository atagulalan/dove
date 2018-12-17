let categories = require("../data/categories").categories;

let returnArr = [];

Object.keys(categories).map(el=>{
    returnArr.push("[" + el + "] -> "+categories[el]);
})

exports.categories = returnArr.join(" | ");