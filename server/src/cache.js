const path = require("path");
const mainPath = path.join(__dirname, '../');
const { config } = require("../../config/config");
const { log } = require("./debug");
const fs = require('fs');
const cache = {};
const customCaches = {};

readContent = (...args) => {
    let cbf = args.pop();
    args[0] = path.join(mainPath,"../",args[0]);
    if(config.cache && cache[args[0]]){
        log("cache","Found from cache!\t\t", args[0]);
        cbf(cache[args[0]].err,cache[args[0]].cnt)
    }else{
        fs.readFile(...args, (err, cnt) => {
            if(!err && config.cache){
                log("cache","Adding to cache...\t\t", args[0]);
                cache[args[0]] = {err,cnt};
                cbf(err,cnt)
            }else{
                log("cache","Not adding to cache...\t\t", args[0]);
                cbf(err,cnt)
            }  
        })
    }
}

customCache = (...args) => {
    if(args[2]){
        //customCache("styles", "https://example.com/style.css", {html:"asda"});
        if(!customCaches[args[0]]){
            customCaches[args[0]] = {};
        }
        customCaches[args[0]][args[1]] = args[2];
        return args[2];
    }else{
        //customCache("styles", "https://example.com/style.css");
        return customCaches[args[0]] && customCaches[args[0]][args[1]];
    }
}

module.exports = {
    readContent, customCache
}