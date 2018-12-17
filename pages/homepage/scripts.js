init = () => {
    getWidth = () => window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
    counterInit = () => {
        let totalPerc = 0,              // Starting at 0
            shownPerc = 0,              // This wont show after %100
            maxPerc = 1,                // Maxiumum percentage overall
            step = 0.01,                // Increase rate for each cycle
            waitRate = 10,              // It will wait 10 steps after unload
            isFakeDone = 0,             // Is it "fake" done? (100%)
            nthDot = 0,                 // How many steps will be there?
            maxDots = 10,               // Max number of dots (x+1 dots will be shown)
            pauseWidth = 1360,          // If width is below this, cycle will pause
            nthItem = 0,                // Indicates which item will be shown
            intervalMS = 100,           // When each cycle will be called
            waitBefore = 750,           // Wait before start slider
            logs = false,               // Should it log details?
            items = [                   // Slider items
                {
                    color: "#f86e8f",
                    image: assets("slide3.png")
                }, {
                    color: "#f86e8f",
                    image: assets("slide2.png")
                }, {
                    color: "#f86e8f",
                    image: assets("slide1.png")
                }
            ],
            slider = $(".slider"),      //Slider element
            image = $(".sliderImage"),  //Slider's image
            line = $(".line"),          //Slider's line
            dots = $(".dots");          //Slider's dots

        log = (...arg) => { logs && console.log(...arg); };
        
        log("Counter Init");

        for (let i = 0; i <= maxDots; i++) {                                                    //Add n dot to dots
            let dot = document.createElement("div");                                            //Create a div
            dot.classList.add("dot");                                                           //Set div's class to "dot"
            dots.append(dot);                                                                   //Add the dot
        }

        log("Dots Added");

        fakeDone = () => {
            log("Fake Done");
            isFakeDone = 1;                                                                     //Set fake done 
            let fakenthItem = nthItem === items.length - 1 ? 0 : nthItem + 1;                   //Cannot change nthItem, so fake it
            image.classList.add("finish");                                                      //Hide image
            timeouts.push(setTimeout(() => {                                                    //Wait for hiding image
                line.classList.add("done");                                                     //Hide line
                timeouts.push(setTimeout(() => {                                                //Wait for resetting line
                    line.classList.add("reset");                                                //Reset line width to 0
                }, 500));
            }, 300));
            timeouts.push(setTimeout(() => {                                                    //Wait for hiding image
                image.classList.add("unload");                                                  //Move image to bottom
                image.classList.remove("finish");                                               //Move image to bottom
                slider.style.background = items[fakenthItem].color;                             //Set background image
            }, 500));
        }

        realDone = () => {
            log("Real Done");
            nthItem = nthItem === items.length - 1 ? 0 : nthItem + 1;                           //Show next image (1->2->3->1)
            totalPerc = nthDot = isFakeDone = 0;                                                //Reset slide (not slider) globals
            for (let i = 0; i <= maxDots; i++) {
                $(".dots .dot", i).classList.remove("bubble");                                  //Remove all bubbles
            }
            line.classList.remove("reset");                                                     //Set line width to 0
            line.classList.remove("done");                                                      //Set line visible again
            image.src = items[nthItem].image;                                                   //Set new image to slide
            image.classList.remove("unload");                                                   //Load new image
        }

        slider.style.background = items[nthItem].color;                                         //Set background color for start item
        image.src = items[nthItem].image;                                                       //Set image for start item
        timeouts.push(setTimeout(() => {                                                        //Wait before starting cycle & showing image
            log("Cycle Started");
            image.classList.remove("unload");                                                   //Remove unload state of image
            intervals.push(setInterval(() => {                                                  //Set slide cycle
                if (getWidth() > pauseWidth) {                                                  //If not paused, run the cycle
                    if (totalPerc < maxPerc + (waitRate * step)) {                              //If total percentage is below 100% + wait cycle
                        if (totalPerc > maxPerc && !isFakeDone) { fakeDone(); }                 //If totalPerc is over done, run "fake" done.
                        let i = Math.floor((shownPerc + step) * maxDots);                       //Which dot should be poppin?
                        if (nthDot <= i) { $(".dots .dot", nthDot++).classList.add("bubble"); } //Pop the dot
                        totalPerc += step;                                                      //And increase total percentage
                    } else { realDone(); }                                                      //If totalPerc is over maxiumum (100% + wait)
                    shownPerc = totalPerc <= maxPerc ? totalPerc : maxPerc;                     //shownPerc can't be greater than maxPerc
                    line.style.width = (shownPerc * 100) + "%";                                 //Set line's width to shownPerc
                }
            }, intervalMS));
        }, waitBefore));
    }

    coolLoadInit();
    counterInit();
}