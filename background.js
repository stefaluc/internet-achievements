// initialize extension
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({
        'begin': {
            "achieved": true,
            "date": new Date().toLocaleString()
        }
    });
    chrome.storage.sync.set({'unique': []});
});

// checks number of tabs every time a new tab is added
chrome.tabs.onCreated.addListener(function() {
    chrome.tabs.query({}, function(tabs) {
        if (tabs.length > 20) {
            checkAchievement('tabs');
        }
    });
});

//----------------Handle popup.html opening----------------//
// called when the user clicks on the browser action icon
chrome.browserAction.onClicked.addListener(function(tab) {
    openPopup();
});

// create popup tab, if already created, switch focus to it
function openPopup() {
    var popupUrl = chrome.extension.getURL('popup.html');
    chrome.tabs.query({}, function(extensionTabs) {
        var found = false;
        for (var i = 0; i < extensionTabs.length; i++) {
            if (popupUrl == extensionTabs[i].url) {
                found = true;
                chrome.tabs.update(extensionTabs[i].id, {"active": true});
            }
        }
        if (!found) {
            chrome.tabs.create({url: "popup.html"});
        }
    });
}

//----------------Handle messaging and storage updates--------//
// receive info from content_script.js
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var time = new Date();
        if (request.smile) {
            checkAchievement('smile');
            return;
        }
        incrementKey('numPageLoads');
        if (request.location.includes('wikipedia.org')) {
            incrementKey('numWikiReads');
        }
        else if (request.url.includes('youtube.com/watch')) {
            incrementKey('numYoutubeVids');
        }
        checkUnique(request.location, function(result) {
            if (result) {
                incrementKey('numUnique');
            }
        });
        if (request.location == 'www.reddit.com') {
            console.log(request.html);
            checkAchievement('redditAccount', request.html);
        }
        else if (request.url == 'https://www.youtube.com/watch?v=dQw4w9WgXcQ') {
            checkAchievement('rickRoll');
        }
        else if (request.url == 'http://boards.4chan.org/b/') {
            checkAchievement('4chan');
        }
        else if (request.location == 'www.youtube.com' && request.url.includes('cat')) {
            checkAchievement('catVideos');
        }
        else if (request.url.includes('urbandictionary.com/define')) {
            checkAchievement('urbanDict');
        }
        else if (time.getHours() > 5 && time.getHours() < 6) {
            checkAchievement('earlyBird');
        }
        else if (time.getHours() > 1 && time.getHours() < 2) {
            checkAchievement('nightOwl');
        }
        else if (request.url.includes('web.archive.org')) {
            checkAchievement('archive');
        }
        else if (request.url.includes('zombo')) {
            checkAchievement('zombocom');
        }
    }
);

// increments/initializes key val
function incrementKey(key) {
    var json = {};
    // get current val
    chrome.storage.sync.get(key, function(result) {
        json[key] = result[key];
        // if value is not undefined update, else init 
        if (json[key]) { // update
            json[key] = json[key] + 1;
            chrome.storage.sync.set(json); 
        } else { // init
            json[key] = 1;
            chrome.storage.sync.set(json);
        }
    });
}

// sets achievement to true in storage if it hasn't already been achieved
function setAchievement(key) {
    chrome.storage.sync.get(key, function(result) {
        if (!result[key]) {
            var data = {};
            data[key] = {
                "achieved": true,
                "date": new Date().toLocaleString()
            }
            chrome.storage.sync.set(data);
        }
    });
}

// listens for changes in storage
chrome.storage.onChanged.addListener(function(changes, namespace) {
    var newAchievements = [];
    for (key in changes) {
        var change = changes[key];
        // boolean key, don't need to check
        if (typeof(change.newValue) == 'object') {
            newAchievements.push(key);
            continue;
        }
        console.log("Storage key %s changed. Old val: %s, new val: %s",
            key, change.oldValue, change.newValue);
        // check incremental achievement progress
        checkAchievement(key);
    }
    // send message to popup to update
    if (newAchievements.length) {
        var message = {
            sender: "bg",
            achievements: newAchievements
        };
        chrome.runtime.sendMessage(message, function() {
            console.log('sending message to popup.js');
        });
    }
});

//----------------Achievement checking functions----------------//
// check if an achievement is gained (data param is optional)
// incremental achievements are continually checked until a certain action number is reached
// boolean achievements are achieved on one specific action
function checkAchievement(achievement, data) {
    switch (achievement) {
        //--------Incremental Achievements--------//
        case 'numPageLoads':
            pageLoads();
            break;
        case 'numWikiReads':
            wiki();
            break;
        case 'numYoutubeVids':
            youtube();
            break;
        case 'numUnique':
            unique();
            break;
        //--------Boolean Achievements--------//
        case 'redditAccount':
            redditAccount(data);
            break;
        case 'rickRoll':
            rickRoll();
            break;
        case 'catVideos':
            catVideos();
            break;
        case 'smile':
            smile();
            break;
        case '4chan':
            fourChan();
            break;
        case 'tabs':
            tabs();
            break;
        case 'urbanDict':
            urbanDict();
            break;
        case 'earlyBird':
            earlyBird();
            break;
        case 'nightOwl':
            nightOwl();
            break;
        case 'archive':
            archive();
            break;
        case 'zombocom':
            zombocom();
            break;
        default:
            return '';
    }
}


//----------------Incremental Achievements----------------//
// check total number of page loads
function pageLoads() {
    chrome.storage.sync.get('numPageLoads', function(result) {
        var numPageLoads = result['numPageLoads'];
        console.log('pageLoads(): numPageLoads: %s', numPageLoads);
        // pagesLoads6
        if (numPageLoads > 100000) {
            setAchievement('pageLoads6');
            return;
        }
        // pagesLoads5
        if (numPageLoads > 50000) {
            setAchievement('pageLoads5');
            return;
        }
        // pagesLoads4
        if (numPageLoads > 10000) {
            setAchievement('pageLoads4');
            return;
        }
        // pageLoads3
        else if (numPageLoads > 1000) {
            setAchievement('pageLoads3');
            return;
        }
        // pageLoads2
        else if (numPageLoads > 100) {
            setAchievement('pageLoads2');
            return;
        }
        // pageLoads1
        else if (numPageLoads > 10) {
            setAchievement('pageLoads1');
        }
    });
}

// check number of wikipedia pages read
function wiki() {
    chrome.storage.sync.get('numWikiReads', function(result) {
        var numWikiReads = result['numWikiReads'];
        console.log('wiki(): numWikiReads: %s', numWikiReads);
        if (numWikiReads > 10000) {
            setAchievement('wiki4');
            return;
        }
        if (numWikiReads > 1000) {
            setAchievement('wiki3');
            return;
        }
        else if (numWikiReads > 100) {
            setAchievement('wiki2');
            return;
        }
        else if (numWikiReads > 10) {
            setAchievement('wiki1');
            return;
        }
    });
}

// check number of youtube videos watched
function youtube() {
    chrome.storage.sync.get('numYoutubeVids', function(result) {
        var numYoutubeVids = result['numYoutubeVids'];
        console.log('youtube(): numYoutubeVids: %s', numYoutubeVids);
        if (numYoutubeVids > 10000) {
            setAchievement('youtube4');
            return;
        }
        else if (numYoutubeVids > 1000) {
            setAchievement('youtube3');
            return;
        }
        else if (numYoutubeVids > 100) {
            setAchievement('youtube2');
            return;
        }
        else if (numYoutubeVids > 10) {
            setAchievement('youtube1');
        }
    });
}

// check if user location is new
function checkUnique(location, callback) {
    chrome.storage.sync.get('unique', function(result) {
        console.log(result);
        var list = result['unique'];
        for (var i = 0; i < list.length; i++) {
            if (list[i].includes(location)) {
                callback(false);
                return;
            }
        }
        console.log('found unique: ' + location);
        // add unique to storage
        list.push(location);
        chrome.storage.sync.set({'unique': list});
        callback(true);
    });
}

// check number of unique websites
function unique() {
    chrome.storage.sync.get('numUnique', function(result) {
        var numUnique = result['numUnique'];
        console.log('unique(): numUnique: %s', numUnique);
        if (numUnique > 1000) {
            setAchievement('unique4');
            return;
        }
        else if (numUnique > 500) {
            setAchievement('unique3');
            return;
        }
        else if (numUnique > 100) {
            setAchievement('unique2');
            return;
        }
        else if (numUnique > 10) {
            setAchievement('unique1');
        }
    });
}


//----------------Boolean Achievements----------------//
// parse reddit page to see if user has account
function redditAccount(data) {
    // message "Want to join?" won't be present on reddit page if user isn't logged in
    if(!data.includes('Want to join?')) {
        setAchievement('redditAccount');
    }
}

// user has been rick rolled
function rickRoll() {
    setAchievement('rickRoll');
}

// user is watching cat videos
function catVideos() {
    setAchievement('catVideos');
}

// user type a smile
function smile() {
    setAchievement('smile');
}

// user visited 4chan /b/
function fourChan() {
    setAchievement('fourChan');
}

// user opened up more than 12 tabs at once
function tabs() {
    setAchievement('tabs');
}

// user looked up word on urban dictionary
function urbanDict() {
    setAchievement('urbanDict');
}

// user was browsing between 5 and 6 AM
function earlyBird() {
    setAchievement('earlyBird');
}

// user was browsing between 1 and 2 AM
function nightOwl() {
    setAchievement('nightOwl');
}

// user viewed internet archive
function archive() {
    setAchievement('archive');
}

// user viewed zombocom
function zombocom() {
    setAchievement('zombocom');
}
