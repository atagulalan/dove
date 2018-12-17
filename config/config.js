exports.config = {
    port:5000,              //DOVE PORT
    title:"XNB",            //SITE TITLE
    cache:true,             //ENABLES IN-MEMORY CACHE, BEWARE IF YOU HAVE MEMORY LESS THAN 1GB
    internal:true,          //ENABLES IN-LINE DEPENDENCIES, REDUCES REQUESTS BY CLIENT
    uglify:true,            //ENABLES UGLY (REALLY, REALLY UGLY) BUT FAST CSS & JS 
    debug:{
        cache:true,         //ENABLES CACHE DEBUG LOGS
        elapsedTime:true    //ENABLES ELAPSED TIME LOGS
    },
    datapath:"data",
    datas:["featured", "errors", "posts", "categories", "lectures"],
}