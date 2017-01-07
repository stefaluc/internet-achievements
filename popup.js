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
                location.reload();
            }, function(status) { // Promise rejected
                alert('Error in xhr request, status of: ' + status);
            });
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

var Main = React.createClass({
    getInitialState: function() {
        return { 
            points: 0,
            carouselItems: []
        };
    },
    // function passed down to child to update points
    updatePoints: function(e) {
        this.setState({points: this.state.points + e});
    },

    render: function() {
        return (
            <div>
                <div className="row">
                    <div className="col s12 z-depth-1 white">
                        <div className="container">
                            <span id="title" className="blue-text text-darken-1">
                                Internet Achievements
                            </span>
                            <div id="points" className="grey-text text-darken-3">
                                <i className="material-icons yellow-text text-darken-1">star</i>
                                Your Points: { this.state.points }
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container">
                    <AchievementsList updateParent={ this.updatePoints } />
                </div>

                {/*<div id="modal1" className="modal">
                    <div className="modal-content">
                        <div className="carousel">
                            { this.carouselItems }
                        </div>
                    </div>
                </div>*/}
            </div>
        );
    }
});

var AchievementsList = React.createClass({
    getInitialState: function() {
        return {
            achieved : [],
            unachieved: [],
        }
    },
    
    setAchieved: function(e) {
        this.setState({achieved: e});
    },

    setUnachieved: function(e) {
        this.setState({unachieved: e});
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
                        achieved.push(json[keys[i]]);
                        this.props.updateParent(json[keys[i]].points);
                    } else { // unachieved
                        unachieved.push(json[keys[i]]);
                    }
                }
                // update state
                this.setAchieved(achieved);
                this.setUnachieved(unachieved);
            }.bind(this));
        }.bind(this));
    },

    render: function() {
        // only render when async complete
        if (this.state.achieved && this.state.unachieved) {
            // get achievement components
            var achievedComps = this.state.achieved.map(function(achievedObj, index) {
                return <Achievement config={achievedObj} achieved={1} key={index} />;
            });
            var unachievedComps = this.state.unachieved.map(function(unachievedObj, index) {
                return <Achievement config={unachievedObj} achieved={0} key={index} />;
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
                        { achieved ? 
                        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                        </svg>
                        :
                        <i className="animated rotateIn material-icons ex">not_interested</i> }
                        <div className="points-card grey-text">
                            { this.props.config.points }pts
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

// get the party started
ReactDOM.render(
    <Main />,
    document.getElementById('main')
);

// initialize materialize js components
$(document).ready(function() {
    $('.carousel').carousel();
    $('.modal').modal();
});
