const UglifyJS = require("uglify-es");
const UglifyCSS = require('uglifycss');
const { customCache } = require("./cache");
const { config } = require("../../config/config");

uglify = (contentUrl, content, type, classes="") => {
    fit = () => {
        if(type==="js"){
            return '<script type="text/javascript" class="'+classes+'">' + UglifyJS.minify(content).code + '</script>';
        }else if(type==="css"){
            return '<style class="'+classes+'">' + UglifyCSS.processString(content) + '</style>';
        }
    };
    if(config.uglify){
        if(config.cache){ 
            let cacheStatus = customCache("content"+type, contentUrl);
            if(cacheStatus){
                return cacheStatus;
            }else{
                return customCache("content"+type, contentUrl, fit())
            }
        }else{
            return fit()
        }
    }
}

module.exports = {
    uglify
}