// initialize extension
chrome.runtime.onInstalled.addListener(function() {
    
});

//--------Handle popup.html opening--------//
// create popup tab, if already created, switch focus to it
function openPopup() {
    var popupUrl = chrome.extension.getURL('popup.html');
    console.log('reached');
    chrome.tabs.query({}, function(extensionTabs) {
        var found = false;
        for (var i=0; i < extensionTabs.length; i++) {
            console.log('popup url:' + popupUrl);
            console.log('tab url:' + extensionTabs[i].url);
            if (popupUrl == extensionTabs[i].url) {
                found = true;
                console.log("tab id: " + extensionsTabs[i].id);
                chrome.tabs.update(extensionTabs[i].id, {"selected":true});
            }
        }
        if (!found) {
            chrome.tabs.create({url: "popup.html"});
        }
    });
}

chrome.extension.onConnect.addListener(function(port) {
    var tab = port.sender.tab;
    // this will get called by the content script we execute in
    // the tab as a result of the user pressing the browser action.
    port.onMessage.addListener(function(info) {
        var max_length = 1024;
        if (info.selection.length > max_length) {
            info.selection = info.selection.substring(0, max_length);
            openPopup();
        }
    });
});

// called when the user clicks on the browser action icon
chrome.browserAction.onClicked.addListener(function(tab) {
    openPopup();
});

//--------Handle messaging and storage updates--------//
// receive info from content_script.js
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('background.js received message');
        console.log(request);
        //--------Incremental Achievements--------/
        updateKey('numPageLoads');
        if (request.location.includes('wikipedia.org')) {
            updateKey('numWikiReads');
        }
        //--------Boolean Achievements--------/
        else if (request.location == 'www.reddit.com') {
            checkAchievement('redditAccount', request.html);
        }
    }
);

// updates storage key
function updateKey(key, newVal) {
    var value;
    var json = {};
    // get current val
    chrome.storage.sync.get(key, function(result) {
        console.log(result);
        console.log('result: ' + result[key]);
        json[key] = result[key];
        // if value is not undefined update, else init 
        if (json[key]) { // update
            if (typeof(json[key]) == 'number') {
                json[key] = json[key] + 1;
                console.log('key: ' + json[key]);
                chrome.storage.sync.set(json); 
            } else {
                json[key] = newVal;
                chrome.storage.sync.set(json); 
            }
        } else { // init
            json[key] = 1;
            chrome.storage.sync.set(json);
            console.log("initialized value");
        }
    });
}

// listens for changes in storage
chrome.storage.onChanged.addListener(function(changes, namespace) {
    var newAchievements = [];
    for (key in changes) {
        var change = changes[key];
        // boolean key, don't need to check
        if (typeof(change.newValue == 'boolean')) {
            newAchievements.push(key);
            continue;
        }
        console.log("Storage key %s changed. Old val: %s, new val: %s", key, change.oldValue, change.newValue);
        console.log('key: ' + key);
        // check incremental achievement progress
        checkAchievement(key);
    }
    // send message to popup to update
    if (newAchievements.length) {
        var message = {sender: "bg", achievements: newAchievements};
        chrome.runtime.sendMessage(message, function() {
            console.log('sending message to popup.js');
        });
    }
});

// check if an achievement is gained (data param is optional)
// incremental achievements are continually checked until a certain action number is reached
// boolean achievements are achieved on one specific action
function checkAchievement(achievement, data) {
    switch (achievement) {
        //--------Incremental Achievements--------//
        case 'numPageLoads':
            return pageLoads();
            break;
        case 'numWikiReads':
            return wiki();
            break;
        //--------Boolean Achievements--------//
        case 'redditAccount':
            return redditAccount(data);
            break;
        default:
            return '';
    }
}

//--------Achievement checking functions--------//
// check total number of page loads
function pageLoads() {
    var numPageLoads;
    chrome.storage.sync.get('numPageLoads', function(result) {
        numPageLoads = result['numPageLoads'];
        console.log('[pageLoads()] numPageLoads: %s', numPageLoads);
        // pagesLoads3
        if (numPageLoads > 10000) {
            // set achievement to true if hasn't been achieved already
            chrome.storage.sync.get('pageLoad3', function(result) {
                if (result['pageLoads3']) {
                    chrome.storage.sync.set({'pageLoads3': true});
                }
            });
        }
        // pageLoads2
        else if (numPageLoads > 1000) {
            // set achievement to true if hasn't been achieved already
            chrome.storage.sync.get('pageLoads2', function(result) {
                if (result['pageLoads2']) {
                    chrome.storage.sync.set({'pageLoads2': true});
                }
            });
        }
        // pageLoads1
        else if (numPageLoads > 1) {
            // set achievement to true if hasn't been achieved already
            chrome.storage.sync.get('pageLoads1', function(result) {
                if (!result['pageLoads1']) {
                    chrome.storage.sync.set({'pageLoads1': true});
                }
            });
        }
    });
}

// check number of wikipedia pages read
function wiki() {
    var numWikiReads;
    chrome.storage.sync.get('numWikiReads', function(result) {
        numPageLoads = result['numWikiReads'];
        console.log('[wiki()] numWikiReads: %s', numWikiReads);
        // wiki3
        if (numWikiReads > 1000) {
            // set achievement to true if hasn't been achieved already
            chrome.storage.sync.get('wiki3', function(result) {
                if (!result['wiki3']) {
                    chrome.storage.sync.set({'wiki3': true});
                }
            });
        }
        // wiki2
        else if (numWikiReads > 100) {
            // set achievement to true if hasn't been achieved already
            chrome.storage.sync.get('wiki2', function(result) {
                if (!result['wiki2']) {
                    chrome.storage.sync.set({'wiki2': true});
                }
            });
        }
        // wiki1
        else if (numWikiReads > 1) {
            // set achievement to true if hasn't been achieved already
            chrome.storage.sync.get('wiki1', function(result) {
                if (!result['wiki1']) {
                    chrome.storage.sync.set({'wiki1': true});
                }
            });
        }
    });
}

// parse reddit page to see if user has account
function redditAccount(data) {
    console.log('reached redditAccount()');
    // message "Want to join?" won't be present on reddit page if user isn't logged in
    if(!data.includes('Want to join?')) {
        chrome.storage.sync.set({'redditAccount': true});
    }
}
