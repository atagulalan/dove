const { config } = require("../../config/config");

log = (...args) => {
    if((config.debug && config.debug[args[0]]) || args[0]==="g"){
        args.shift()
        console.log(...args);
    }
}

elapsedTime = (note, newTimer) => {
    if(newTimer){
        start = process.hrtime();
        log("elapsedTime","\t\t- "+note); 
    }else{
        var precision = 3;
        var elapsed = process.hrtime(start)[1] / 1000000;
        log("elapsedTime",(process.hrtime(start)[0]*1000 - -elapsed.toFixed(precision)) + " ms \t- " + note);
        start = process.hrtime();
    }
}

module.exports = {
    elapsedTime, log
}