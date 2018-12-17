const path = require("path");
const { config } = require("../../config/config");
const imports = config.datas;

//Get globals for replace
let externalGlobals = {};

addToExternalGlobals = (key, main, name) => {
    if (typeof key === "object") {
        for (let j = 0; j < Object.keys(key).length; j++) {
            let subkey = Object.keys(key)[j];
            let subname = subkey.replace(/\s/g, "_").replace(/[^A-Za-z0-9\-\_]+/g, '').toUpperCase();
            addToExternalGlobals(key[subkey], main, name + "_" + subname)
        }
    } else {
        externalGlobals[["%" + main + "_" + name + "%"]] = key;
    }
}

for (let i = 0; i < imports.length; i++) {
    let fname = imports[i];
    let imp = require("../../"+config.datapath+"/" + fname);
    Object.keys(imp[fname]).map(el => addToExternalGlobals(imp[fname][el], fname.toUpperCase(), el.replace(/\s/g, "_").toUpperCase()));
}

replaceGlobals = (content, obj) => {
    //Imports
    content = content.replace(/`\%IMPORT\((.*?)\)\%`/gi, function (...p) {
        let returnObj = require(path.join(__dirname,"../../imports/", p[1]))
        return returnObj[p[1]];
    });

    //Math
    content = content.replace(/%MATH%/gi, function () {
        return '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css">';
    });

    //Variables
    if(obj){
        content = content.replace(new RegExp(Object.keys(obj).map(el => "{" + el + "}").join("|"), "g"), function (m) {
            return obj[m.substring(1, m.length - 1)];
        })
    }

    //Globals
    content = content.replace(new RegExp(Object.keys(externalGlobals).join("|"), "g"), function (m) {
        return externalGlobals[m];
    });

    return content;
}

module.exports = {
    replaceGlobals
};