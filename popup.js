// reinitialize page when new achievement message is received
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message.sender == "bg") {
            getJSON('achievements.json').then(function(json) {
                // display rich notification for new achievement
                for(var i = 0; i < message.achievements.length; i++) {
                    var key = json[message.achievements[i]];
                    var opt = {
                        type: "basic",
                        title: key.title,
                        message: key.description,
                        iconUrl: 'assets/images/logo.png'
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
            points: 0, // updated after AchievementList mount
            carouselItems: { // empty until user clicks incremental achievement
                components: [],
                stats: 0
            },
            achievementComponents: {} // populated with all Achievement components on render
        };
    },

    // passed down to AchievementList
    updatePoints: function(e) {
        this.setState({points: this.state.points + e});
    },

    // passed down to Achievement
    updateCarousel: function(e) {
        var items = {
            components: [],
            stats: 0
        };
        // get components of active carousel items (clicked achievement's group)
        for (var i = 0; i < e.group.length; i++) {
            items.components.push(this.state.achievementComponents[e.group[i]]);
        }
        // get current stats from storage
        chrome.storage.sync.get(e.stats, function(result) {
            items.stats = result[e.stats];
            this.setState({carouselItems: items});
        }.bind(this));
    },

    // passed down to AchievementList
    updateAchievements: function(e) {
        this.setState({achievementComponents: e});
    },

    render: function() {
        var componentMain = (
            <div>
                <Header points={this.state.points} />
                <div className="container">
                    <AchievementsList
                        updateParentPoints={ this.updatePoints }
                        updateParentCarousel={ this.updateCarousel }
                        updateParentAchievements={ this.updateAchievements } />
                </div>
            </div>
        );
        // generate CarouselItems if an incremental achievement was clicked
        var carouselComponents = [];
        if (this.state.carouselItems.components.length) {
            // get CarouselItem components
            carouselComponents = this.state.carouselItems.components.map(function(item, index) {
                return <CarouselItem card={item} key={index} />;
            });
            // hack to make not-so-React-optimized carousel work properly
            setTimeout(function() {
                // init carousel
                $('.carousel').carousel({
                    no_wrap: true, 
                    indicators: true,
                    dist: 0,
                    padding: 200
                });
                // removes hide class from hidden React components in carousel
                $('.carousel-item').children().each(function() {
                    $(this).children().removeClass('hide');
                });
            }, 50);
        }

        // hack to init modal
        setTimeout(function() { $('.modal').modal(); }, 10);

        return (
            <div>
                { componentMain }
                <Carousel stat={this.state.carouselItems.stats}>
                    { carouselComponents }
                </Carousel>
            </div>
        );
    }
});

// contains title and current score
var Header = React.createClass({
    render: function() {
        return (
            <div className="row">
                <div className="col s12 z-depth-1 white">
                    <div className="container">
                        <span id="title" className="blue-text text-darken-1">
                            Internet Achievements
                        </span>
                        <div id="points" className="grey-text text-darken-3">
                            <i className="material-icons yellow-text text-darken-1">star</i>
                            Your Points: { this.props.points }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

// contains materialize CarouselItems wrapped in materialize carousel and modal
var Carousel = React.createClass({
    render: function() {
        return (
            <div id="modal1" className="modal">
                <div className="modal-content">
                    <div className="modal-content">
                        <span className="modal-title grey-text text-darken-3">
                            <i className="material-icons small">insert_chart</i>
                            Current: { this.props.stat }
                        </span>
                        <div className="carousel">
                            { this.props.children }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

// single item in materialize carousel
var CarouselItem = React.createClass({
    render: function() {
        return (
            <a className="carousel-item">
                { this.props.card }
            </a>
        );
    }
});

var AchievementsList = React.createClass({
    getInitialState: function() {
        return {
            achieved : [],
            unachieved: [],
            render: false
        }
    },
    
    setAchieved: function(e) {
        this.setState({achieved: e});
    },

    setUnachieved: function(e) {
        this.setState({unachieved: e});
    },

    setRender: function(e) {
        this.setState({render: e});
    },

    // send achievement components to parent
    sendAchievements: function(e) {
        this.setRender(false); // avoid infinite loop
        this.props.updateParentAchievements(e);
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
                        // keep key associated with data
                        var key = keys[i];
                        var obj = {};
                        obj[key] = json[key];
                        achieved.push(obj);
                        // send points to parent
                        this.props.updateParentPoints(json[keys[i]].points);
                    } else { // unachieved
                        // keep key associated with data
                        var key = keys[i];
                        var obj = {};
                        obj[key] = json[key];
                        
                        // Makes it so only the next unachieved incremental achievement in series will be
                        // displayed. This avoids cluttering of long chains of incremental achievements.
                        // All incrementals for series will still be displayed in modal carousel and all 
                        // achieved incrementals will also be displayed
                        if (!isNaN(Number(key.slice(-1))) &&
                                Number(key.slice(-1)) != 1 &&
                                    !result[key.slice(0, key.length-1)+(Number(key.slice(-1)) - 1).toString()]) {
                            obj[key].duplicate = true;
                        }

                        unachieved.push(obj);
                    }
                }
                // update state
                this.setAchieved(achieved);
                this.setUnachieved(unachieved);
                this.setRender(true);
            }.bind(this));
        }.bind(this));
    },

    // blocks rerendering if not specified to
    shouldComponentUpdate: function(nextProps, nextState) {
        return nextState.render;
    },

    componentDidUpdate: function(prevProps, prevState) {
        this.setRender(false);
    },

    render: function() {
        // get achievement components
        var components = {};
        var achievedComps = this.state.achieved.map(function(achievedObj, index) {
            var achievement =
                <Achievement
                    config={ achievedObj[Object.keys(achievedObj)[0]] }
                    updateParentCarousel={ this.props.updateParentCarousel }
                    achieved={ 1 } 
                    key={ index } />;
            // store component to be saved in Main
            var key = Object.keys(achievedObj);
            components[key] = achievement;

            return achievement;
        }.bind(this));

        var unachievedComps = this.state.unachieved.map(function(unachievedObj, index) {
            var achievement =
                <Achievement
                    config={ unachievedObj[Object.keys(unachievedObj)[0]] }
                    updateParentCarousel={ this.props.updateParentCarousel }
                    achieved={ 0 }
                    key={ index } />;
            // store component to be saved in Main
            var key = Object.keys(unachievedObj);
            components[key] = achievement;

            return achievement;
        }.bind(this));

        this.sendAchievements(components); // send saved components to Main

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
    }
});

var Achievement = React.createClass({
    // when user clicks on incremental achievement
    handleClick: function() {
        this.props.updateParentCarousel(this.props.config);
    },

    render: function() {
        var achieved = this.props.achieved; // bool val, if achieved
        
        // achievement card with varying information based on achieved val, some incremental achievements
        // may not be displayed (i.e. given the hide class)
        var component = (
            <div className={"col s12 m3 " + (this.props.config.duplicate ? "hide" : "")}>
                <div className={"animated fadeIn card small hoverable " 
                    + (achieved ? "white" : ("grey lighten-3"))}>
                    <div className="card-content blue-text text-darken-1">
                        <span className="card-title">{ this.props.config.title }</span>
                        <p className="grey-text text-darken-3">
                            { this.props.config.description }
                        </p>
                        {
                            achieved ?
                            (<p className="grey-text date">{ this.props.config.date }</p>) 
                            :
                            ''
                        }
                    </div>
                    <div className="card-action">
                        {
                            achieved ? 
                             (<svg className="checkmark" 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 52 52">
                                <circle className="checkmark__circle" 
                                    cx="26" cy="26" r="25" fill="none"/>
                                <path className="checkmark__check" fill="none"
                                    d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                              </svg>)
                            :
                             (<i className="animated rotateIn material-icons ex">
                                not_interested
                              </i>)
                        }
                        <div className="points-card grey-text">
                            { this.props.config.points } pts
                        </div>
                    </div>
                </div>
            </div>
        );
        // make incrementals open modal
        if (this.props.config.type == "incremental") {
            return (
                <a className="modal-trigger" href="#modal1" onClick={ this.handleClick }>
                    { component }
                </a>
            );
        }
        return component;
    }
});


// get the party started
ReactDOM.render(
    <Main />,
    document.getElementById('main')
);
