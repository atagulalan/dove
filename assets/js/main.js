$ = (q, e) => {
    let i = typeof e === "number" ? e : undefined;
    let o = typeof e === "object" ? e : undefined;
    let r = o ? o.querySelectorAll(q) : document.querySelectorAll(q);
    if(i!==undefined){
        return r[i];
    }else if(r.length===1){
        return r[0];
    }else{
        return r;
    }
}

//YouMightNotNeedjQuery
HTMLElement.prototype.find = function(q){return $(q, this)};
HTMLElement.prototype.hasClass = function(q){return this.classList ? this.classList.contains(q) : new RegExp('(^| )' + q + '( |$)', 'gi').test(this.q); }
HTMLElement.prototype.addClass = function(q){return this.classList ? this.classList.add(q) : this.className += ' ' + q;}
HTMLElement.prototype.removeClass = function(q){return this.classList ? this.classList.remove(q) : this.className = this.className.replace(new RegExp('(^|\\b)' + q.split(' ').join('|') + '(\\b|$)', 'gi'), ' '); }
HTMLElement.prototype.toggleClass =  function(q){return this.hasClass(q) ? this.removeClass(q) : this.addClass(q); }
HTMLElement.prototype.attr = function(q,s){return s!==undefined ? this.setAttribute(q, s) : this.getAttribute(q); }
HTMLElement.prototype.data = function(q,s){return this.attr("data-"+q,s); }
HTMLElement.prototype.html = function(q){return this.innerHTML=q; }
HTMLElement.prototype.forEach = function(q,s){return [this].forEach(q,s); }
HTMLElement.prototype.append = function(q){return this.appendChild(q); }

let intervals = [];
let timeouts = [];

coolLoadInit = () => {
    for(let i=0; i<$(".coolLoad").length; i++){
        let item = $(".coolLoad",i);
        let maxW = item.find(".waitLoad").getBoundingClientRect().width;
        let baseTime = 1000;
        item.addClass("loading"); 
        let dTime = item.hasClass("now") ? 0 
                    : item.hasClass("dqs") ? 250
                    : item.hasClass("dhs") ? 500
                    : item.hasClass("d1s") ? 1000
                    : item.hasClass("d1hs") ? 1500
                    : item.hasClass("d2s") ? 2000 : 0;
        item.style.width=maxW+"px"; 
        setTimeout(()=>{
            item.removeClass("loading"); 
            item.style.width=""; 
        },baseTime + dTime) 
    }
}

internalLinkCatcher = (e) => {
    e.preventDefault();
    history.pushState(null, null, e.currentTarget.href);
    routerInit(location.href);
}

externalLinkCatcher = (e) => {
    e.preventDefault();
    let win = window.open(e.currentTarget.href, '_blank');
    win.focus();
}

linkerInit = () => {
    audioInit();
    $('#root a').forEach( a => { 
        console.log(a.pathname)
        if(location.hostname === a.hostname || !a.hostname.length){
            if(a.pathname.indexOf(".")!==-1){
                //Links contain dot are download links
                a.addEventListener("click", externalLinkCatcher);
                a.classList.add('internal');
            }else{
                a.addEventListener("click", internalLinkCatcher);
                a.classList.add('internal');
            }
        }else{
            a.addEventListener("click", externalLinkCatcher);
            a.classList.add('external');
        }
    });
    let title = $("main h1", 0);
    document.title = title ? title.innerText + " - DOVE" : "DOVE";
}

getURL = (url, callback) => {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if(callback){
                callback(this.responseText);
            }
        }
    };
    xhttp.open("GET", url+"?v="+((new Date()).getTime()), true);
    xhttp.send();
}


dependenciesLoaded = () => {
    if(typeof init === "function"){ init(); }
    linkerInit();
}

setMain = (content,page) => {
    $("main").html("");
    init = () => {}
    content.replace(/<meta.*?name="(.*?)".*?content="(.*?)" \/>/gi, function () {
        let dps = arguments[2].split(",").map(el=>el.trim());
        if(arguments[1]==="dependencies"){
            for(let i=0;i<dps.length;i++){
                let type = dps[i].split(".").slice(-1)[0];
                let path = "/pages/"+page+"/"+dps[i];
                if(type==="js"){
                    let scriptElement = document.createElement('script');
                    scriptElement.setAttribute('type', 'text/javascript');
                    scriptElement.classList.add("willBeRemoved");
                    scriptElement.classList.add("notLoaded");
                    scriptElement.onload = () => {
                        scriptElement.classList.remove("notLoaded");
                    }
                    scriptElement.src = path;
                    $('head').appendChild(scriptElement);
                }else if(type==="css"){
                    let styleElement = document.createElement("link");
                    styleElement.rel = "stylesheet";
                    styleElement.type = "text/css";
                    styleElement.classList.add("willBeRemoved");
                    styleElement.classList.add("notLoaded");
                    styleElement.onload = () => {
                        styleElement.classList.remove("notLoaded");
                    }
                    styleElement.href = path;
                    $("head").appendChild(styleElement);
                }
            }
        }
    });
    $("main").html(content);
    //If new page doesn't have dependencies, do not trigger old dependency init
    let loadDep = $(".notLoaded").length ? ()=>{dependenciesLoaded(page)} : ()=>{linkerInit();};
    let waiting = setInterval(() => {
        if($(".notLoaded").length===0){
            clearInterval(waiting);
            $("#root").data("page", page);
            loadDep();
        } 
    },1);
}

unload = () => {
    console.log("Section Unloaded:\t", $("#root").data("page"));
    for(let i=0;i<intervals.length;i++){ clearInterval(intervals[i]); }
    for(let j=0;j<timeouts.length;j++){ clearTimeout(timeouts[j]); }
}

loadPage = (page) => {
    $("#root").data("page","loading");
    if(typeof unload === "function"){ unload(); }
    let items = [];
    for(let i=0;i<$(".willBeRemoved").length;i++){
        items.push($(".willBeRemoved",i));
    }
    for(let i=0;i<items.length;i++){
        items[i].remove();
    }
    console.log("Section Loaded:\t\t", page);
    getURL("/pages/"+page+"/content.html", (response)=>{
        response = response.replace(/%ASSETS%/g, "/pages/"+page+"/assets");
        setMain(response,page);
    });
}

assets = (asset) => {
    return "/pages/"+$("#root").data("page")+"/assets/"+asset;
}

routerInit = (url) => {
    url = url.replace(/^.*\/\/[^\/]+/, '');
    let routes = [
        //\/      -> ROOT
        //([^/]*) -> MATCH GROUP 1
        //[\/]    -> BEFORE ANOTHER GROUP IF ANY
        //([^/]*) -> MATCH GROUP 2        
        { location: '\/', callback: () => loadPage("homepage") },
        {
            location: '\/lecture\/([^/]*)',
            callback: (match)=>{
                console.log("ders", match)
                loadPage("lectures/"+match[1]);
            }
        },
        {
            location: '\/([^/]*)',
            callback: (match)=>{
                console.log("blog", match)
                loadPage("blogs/"+match[1]);
            }
        }
    ]
    for(let i=0;i<routes.length;i++){
        let fullMatch = "^"+routes[i].location+"$";
        if(url.match(fullMatch)){
            routes[i].callback(url.match(fullMatch));
            break;
        }
    }
}

navigationHandlerInit = () => {
    window.onpopstate = function () {
        routerInit(document.location.toString());
    }   
}

audioInit = () => {
    $('main .audioplayer').forEach( (ap, i) => {
        let music = ap.find('audio');
        let duration = music.duration;
        let pButton = ap.find('.p');
        let playhead = ap.find('.d');
        let timeline =ap.find('.l');
        let timelineWidth = timeline.offsetWidth - playhead.offsetWidth + 20;

        timeline.style.width = timeline.offsetWidth + "px";
      
        // play button event listenter
        pButton.addEventListener("click", play);
      
        // timeupdate event listener
        music.addEventListener("timeupdate", timeUpdate, false);
      
        // makes timeline clickable
        timeline.addEventListener("click", function(event) {
            moveplayhead(event);
            music.currentTime = duration * clickPercent(event);
        }, false);
      
        // returns click as decimal (.77) of the total timelineWidth
        function clickPercent(event) {
            return (event.clientX - getPosition(timeline)) / timelineWidth;
        }
      
        // makes playhead draggable
        playhead.addEventListener('mousedown', mouseDown, false);
        window.addEventListener('mouseup', mouseUp, false);
      
        // Boolean value so that audio position is updated only when the playhead is released
        let onplayhead = false;
      
        // mouseDown EventListener
        function mouseDown() {
            onplayhead = true;
            window.addEventListener('mousemove', moveplayhead, true);
            music.removeEventListener('timeupdate', timeUpdate, false);
        }
      
        // mouseUp EventListener
        // getting input from all mouse clicks
        function mouseUp(event) {
            if (onplayhead == true) {
                moveplayhead(event);
                window.removeEventListener('mousemove', moveplayhead, true);
                // change current time
                music.currentTime = duration * clickPercent(event);
                music.addEventListener('timeupdate', timeUpdate, false);
            }
            onplayhead = false;
        }
        // mousemove EventListener
        // Moves playhead as user drags
        function moveplayhead(event) {
            let newMargLeft = event.clientX - getPosition(timeline);
      
            if (newMargLeft >= 0 && newMargLeft <= timelineWidth) {
                playhead.style.marginLeft = newMargLeft + "px";
            }
            if (newMargLeft < 0) {
                playhead.style.marginLeft = "0px";
            }
            if (newMargLeft > timelineWidth) {
                playhead.style.marginLeft = timelineWidth + "px";
            }
        }
      
        // timeUpdate
        // Synchronizes playhead position with current point in audio
        function timeUpdate() {
            let playPercent = timelineWidth * (music.currentTime / duration);
            playhead.style.marginLeft = playPercent + "px";
            if (music.currentTime == duration) {
                pButton.className = "";
                pButton.className = "p";
            }
        }
      
        //Play and Pause
        function play() {
            // start music
            if (music.paused) {
                Array.from($('.audioplayer')).forEach( (el, j) => {
                  if(i!==j && !el.find('audio').paused){
                    el.find('audio').pause();
                    el.find('.s').className = "p";
                  }
                });
                music.play();
                // remove play, add pause
                pButton.className = "s";
            } else { // pause music
                music.pause();
                // remove pause, add play
                pButton.className = "p";
            }
        }
      
        // Gets audio file duration
        music.addEventListener("canplaythrough", function() {
            duration = music.duration;
        }, false);
      
        // getPosition
        // Returns elements left position relative to top-left of viewport
        function getPosition(el) {
            return el.getBoundingClientRect().left;
        }  
    });
}

//Init Placeholder
init = ()=>{}

main = () => {
    console.log("%cWe are good to go!", "color:#f86e8f;background:#282828;padding:10px 20px;font-size:24px;");
    linkerInit();
    coolLoadInit();
    navigationHandlerInit();
    init();
}