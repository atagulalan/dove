const express = require('express');
const path = require("path");
const { config } = require("../config/config");
const { replaceGlobals } = require("./src/globals");
const { readContent } = require("./src/cache");
const { elapsedTime, log } = require("./src/debug");
const { uglify } = require("./src/uglify");
const { md } = require("./src/markdown");
const app = express();
const types = {
    "page": "",
    "blog": "blogs",
    "lecture": "lectures"
}

String.prototype.setAssets = function(page) {
    return this.replace(/%ASSETS%/g, "/pages/" + page + "/assets");
}

String.prototype.setHead = function (head, title, page, isH1) {
    page = isH1 && page ? page.toString().substring(2) : page;
    return this.replace(/%HEAD%/g, head + "<title>" + (page ? page + " - " + title : title) + "</title>");
};

String.prototype.setMain = function (main) {
    return this.replace(/%MAIN%/g, main);
}

errorPage = (code, template, res, withFunction=q=>q) => {
    readContent("./pages/errorpage/content.md", "utf8", (err, errorpage) => {
        res.status(code);
        let error = withFunction(replaceGlobals(errorpage, { code }))
        if (template !== null) {
            res.send(template.setHead("", config.title, code).setMain(error));
        } else {
            res.send(error);
        }
    });
}

// template is needed for direct access of a page
getTemplate = (page, res, withFunction=q=>q) => {
    elapsedTime("Getting Template", 1);
    readContent("./content.node", "utf8", function (err, template) {
        if (err) throw err;

        // loaded at the beginning if it's direct access
        template = template.replace(/(.*?)data-page="(.*?)"(.*?)/gi, function (...p) {
            return (p[1] + "data-page=\"" + page + "\"" + p[3]);
        })

        let replaces = [
            { type: "css", URLWrapper: ["%STYLE=", "%"], linkWrapper: ['<link rel="stylesheet" type="text/css" href="', '">'] },
            { type: "js", URLWrapper: ["%SCRIPT=", "%"], linkWrapper: ['<script type="text/javascript" src="', '"></script>'] }
        ];

        // embed css & js files to template
        if (config.internal) {

            // stash promises
            let promiseArray = [];
            replaces.map(r=>{
                template.replace(new RegExp(r.URLWrapper[0]+"(.*?)"+r.URLWrapper[1],"gi"), function (...p) {
                    promiseArray.push(new Promise(function (resolve, reject) {
                        readContent(p[1], "utf8", function (err, c) {
                            if (err) { throw err }
                            let code = uglify(p[1], c, r.type);
                            resolve({ ref: r.URLWrapper[0] + p[1] + r.URLWrapper[1], code });
                        });
                    }));
                });
            })

            // run promises and after all completed, embed codes
            Promise.all(promiseArray).then(function (values) {
                if(values.length>0){
                    template = template.replace(new RegExp(values.map(el => el.ref).join("|"), "g"), function (m) {
                        return values.find(el => el.ref === m).code;
                    });
                }
                elapsedTime("Template Got");
                getPage(page, res, template, withFunction);
            });
        } 
        
        // if config is NOT internal, load them in client-side
        else {
            replaces.map(r=>{
                template = template.replace(new RegExp(r.URLWrapper[0]+"(.*?)"+r.URLWrapper[1],"gi"), function (...p) {
                    return r.linkWrapper[0] + p[1] + r.linkWrapper[1];
                });
            });
            elapsedTime("Template Got");
            getPage(page, res, template, withFunction);
        }
    });
}

// got template, needs content to fill it up
getPage = (page, res, template, withFunction) => {
    elapsedTime("Getting Page ("+page+")", 1);
    // if url contains bad characters, show 400 and stop executing
    if (!page.match(/^([A-Za-z0-9\-\_\/]*)$/g)) {
        errorPage(400, template, res, md);
        return false;
    }
    // get page content
    readContent("./pages/" + page + "/content.md", "utf8", function (err, main) {
        if (err) {
            errorPage(404, template, res, md);
            return false;
        } else {

            endGetting = (head) => {
                res.send(template.setHead(head, config.title, main.match(/^# (.*)/g), true).setMain(withFunction(main.setAssets(page))));
                elapsedTime("Page Sent");
            }

            // if content exists, replace globals and insert into main
            main = replaceGlobals(main);
            let dependencies = [];
            let head = "";
            main = main.replace(/<meta.*?name="(.*?)".*?content="(.*?)" \/>/gi, function () {
                let dps = arguments[2].split(",").map(el => el.trim());
                if (arguments[1] === "dependencies") {
                    dependencies = dps;
                }
                return "";
            });

            if (config.internal) {
                let promiseArray = [];
                for (let i = 0; i < dependencies.length; i++) {
                    promiseArray.push(new Promise(function (resolve, reject) {
                        let contentUrl = "./pages/" + page + "/" + dependencies[i];
                        readContent(contentUrl, "utf8", function (err, content) {
                            if (err) {
                                resolve("");
                            } else {
                                let type = dependencies[i].split(".").slice(-1)[0];
                                if (type === "js") {
                                    resolve(uglify(contentUrl, content, "js", "willBeRemoved"))
                                } else if (type === "css") {
                                    resolve(uglify(contentUrl, content, "css", "willBeRemoved"))
                                }
                            }
                        });

                    }));
                }
                Promise.all(promiseArray).then(function (values) {
                    endGetting(values.join(""));
                });
            } else {
                for (let i = 0; i < dependencies.length; i++) {
                    let type = dependencies[i].split(".").slice(-1)[0];
                    let path = "/pages/" + page + "/" + dependencies[i];
                    if (type === "js") {
                        head += '<script type="text/javascript" class="willBeRemoved" src="' + path + '"></script>'
                    } else if (type === "css") {
                        head += '<link rel="stylesheet" type="text/css" class="willBeRemoved" href="' + path + '">'
                    }
                }
                endGetting(head);
            }
        }
    });
}


// redirected from inside, no need for template, just page content
getContent = (req, res, type) => {
    let pathToContent = (types[type] === "" ? "" : types[type] + "/") + req.params.blogId;
    elapsedTime("Getting Content ("+pathToContent+")", 1);
    readContent("./pages/" + pathToContent + "/content.md", "utf8", function (err, blogContent) {
        if (err) {
            errorPage(404, null, res, md);
            return false;
        } else {
            // 1- replace globals
            // 2- replace assets
            // 3- md to html
            res.send(md(replaceGlobals(blogContent).setAssets(pathToContent)));
            elapsedTime("Content Sent");
        }
    });
}

//Public Folder
app.use(express.static(path.join(__dirname, '../')));

//Direct Access
app.get('/', (req, res) => { getTemplate("homepage", res); });
app.get('/:blogId', (req, res) => { getTemplate("blogs/" + req.params.blogId, res, md); });
app.get('/lecture/:blogId', (req, res) => { getTemplate("lectures/" + req.params.blogId, res, md); });

//content.md
Object.keys(types).map(el => {
    app.get('/pages/' + (types[el] === "" ? "" : types[el] + "/") + ':blogId/content.html', (req, res) => { getContent(req, res, el) });
})

//Error 404
app.use(function (req, res) { res.redirect('/404'); });

//Init
app.listen(config.port, () => log("g",`Dove is listening on port ${config.port}!`)) 