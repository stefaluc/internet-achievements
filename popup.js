var cardContainer = document.getElementsByClassName('container')[1];

window.onload = function() {
    //init();
}

// reinitialize page when new achievement message is received
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        console.log('popup.js receive message. sender: ' + sender);
        if (message.sender == "bg") {
            getJSON('achievements.json').then(function(json) {
                // display rich notification for new achievement
                for(var i = 0; i < message.achievements.length; i++) {
                    var key = json[message.achievements[i]];
                    var opt = {
                        type: "basic",
                        title: key.title,
                        message: key.description,
                        iconUrl: 'temp.png'
                    }
                    chrome.notifications.create(opt);
                }
            }, function(status) { // Promise rejected
                alert('Error in xhr request, status of: ' + status);
            });
            init();
        }
    }
);

// creates xhr promise to get a url
var getJSON = function(url) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', chrome.extension.getURL(url), true);
        xhr.responseType = 'json';
        xhr.onload = function() {
            if (xhr.status == 200) {
                resolve(xhr.response);
            } else {
                reject(xhr.status);
            }
        };
        xhr.send();
    });
}

function init() {
    // get achievements.json data
    getJSON('achievements.json').then(function(json) {
        // clear dynamic content to reinit
        cardContainer.innerHTML = '';
        document.getElementById('points').innerHTML = '';

        var keys = Object.keys(json);
        var points = 0;
        // get gained achievements
        chrome.storage.sync.get(keys, function(result) {
            console.log(result[keys[0]]);
            console.log(result);
            cardContainer.innerHTML += '<div id="achieved" class="row"></div>';
            cardContainer.innerHTML += '<div id="unachieved" class="row"></div>';
            // display all achievements
            for(var i = 0; i < keys.length; i++) {
                if(result[keys[i]] && result[keys[i]].achieved) { // achieved
                    console.log(json[keys[i]].points);
                    points += json[keys[i]].points;
                    document.getElementById('achieved').innerHTML += '<div class="col s12 m3"><div class="animated fadeIn card small white hoverable"><div class="card-content blue-text text-darken-1"><span class="card-title">' + json[keys[i]].title + '</span><p class="grey-text text-darken-3">' + json[keys[i]].description + '</p><p class="grey-text date">' + result[keys[i]].date + '</p></div><div class="card-action"><svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg><div class="points-card grey-text">' + json[keys[i]].points + ' pts</div></div></div></div>';
                } else { // not achieved
                    document.getElementById('unachieved').innerHTML += '<div class="col s12 m3"><div class="animated fadeIn card small grey lighten-3 hoverable"><div class="card-content blue-text text-darken-1"><span class="card-title">' + json[keys[i]].title + '</span><p class="grey-text text-darken-3">' + json[keys[i]].description + '</p></div><div class="card-action"><i class="animated rotateIn material-icons" style="font-size:40px; color:red">not_interested</i><div class="points-card grey-text">' + json[keys[i]].points + ' pts</div></div></div></div>';
                }
            }
            document.getElementById('points').innerHTML += '<span class="right-align"><i class="material-icons yellow-text text-darken-1">star</i> Your Points: ' + points + '</span>';

            // set cards to hidden and have them incrementally fade in
            cards = document.getElementsByClassName('fadeIn');
            fadeInCount = 0;
            for (var i = 0; i < cards.length; i++) {
                cards[i].className += ' hide';
                setTimeout(fadeIn, 150*i);
            }
        });
    }, function(status) { // Promise rejected
        alert('Error in xhr request, status of: ' + status);
    });
}

var cards;
var fadeInCount;
function fadeIn() {
    // remove hide class
    cards[fadeInCount].className = cards[fadeInCount].className.slice(0, cards[fadeInCount].className.length - 5)
    fadeInCount++;
}


var AchievementsList = React.createClass({
    getInitialState: function() {
        return {
            achieved : [],
            unachieved: [],
            points: 0
        }
    },
    
    setAchieved: function(e) {
        this.setState({achieved: e});
    },

    setUnachieved: function(e) {
        this.setState({unachieved: e});
    },

    setPoints: function(e) {
        this.setState({points: this.state.points + e});
    },
    
    // causes component to rerender when async call completes and this.state is updated
    componentDidMount: function() {
        getJSON('achievements.json').then(function(json) {
            var keys = Object.keys(json);
            // get achievements that are in storage
            chrome.storage.sync.get(keys, function(result) {
                // organize achievements into lists
                var achieved = [], unachieved = [];
                for (var i = 0; i < keys.length; i++) {
                    if (result[keys[i]] && result[keys[i]].achieved) { // achieved
                        json[keys[i]].date = result[keys[i]].date; // copy date to json
                        console.log(json[keys[i]]);
                        achieved.push(json[keys[i]]);
                        this.setPoints(json[keys[i]].points);
                    } else { // unachieved
                        unachieved.push(json[keys[i]]);
                        this.setPoints(json[keys[i]].points);
                    }
                }
                // update state
                this.setAchieved(achieved);
                this.setUnachieved(unachieved);
            }.bind(this));
        }.bind(this));
    },

    render: function() {
        if (this.state.achieved && this.state.unachieved) {
            // get achievement components
            var achievedComps = this.state.achieved.map(function(achievedObj, index) {
                return <Achievement config={achievedObj} achieved="1" key={index} />;
            });
            var unachievedComps = this.state.unachieved.map(function(unachievedObj, index) {
                return <Achievement config={unachievedObj} achieved="" key={index} />;
            });

            return (
                <div>
                    <div className="row">
                        { achievedComps }
                    </div>
                    <div className="row">
                        { unachievedComps }
                    </div>
                </div>
            );
        } else {
            return <div>Loading...</div>;
        }
    }
});

var Achievement = React.createClass({
    getInitialState: function() {
        return { achieved: this.props.achieved };
    },

    render: function() {
        var achieved = this.getInitialState().achieved; // bool val, if achieved
        return (
            <div className="col s12 m3">
                <div className={"animated fadeIn card small hoverable " + (achieved ? "white" : ("grey lighten-3"))}>
                    <div className="card-content blue-text text-darken-1">
                        <span className="card-title">{ this.props.config.title }</span>
                        <p className="grey-text text-darken-3">{ this.props.config.description }</p>
                        {achieved ? (<p className="grey-text date">{ this.props.config.date }</p>) : ''}
                    </div>
                    <div className="card-action">
                        {
                            achieved 
                                ? 
                                <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                    <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                                 </svg>
                                :
                                <i className="animated rotateIn material-icons ex">not_interested</i>
                        }
                        <div className="points-card grey-text">
                            { this.props.config.points }pts
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});


ReactDOM.render(<AchievementsList />, document.getElementById('achievements'));
