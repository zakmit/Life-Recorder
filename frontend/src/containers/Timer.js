import React, { Component } from 'react'
import { Switch, Route, Redirect, NavLink } from 'react-router-dom'
import Settings from './Settings'
import Statistics from './Statistics'
import queryString from 'query-string'
import Home from './Home'
import MediaQuery from 'react-responsive'
import { slide as Menu } from 'react-burger-menu'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import Popup from "reactjs-popup";
import firebase from 'firebase/app';
import 'firebase/auth';
import P5Wrapper from 'react-p5-wrapper';
import sketch from '../components/Sketch';
import SeashoreBlue from '../themes/SeashoreBlue.json';
import Seashore from '../themes/Seashore.json';
const server = "http://localhost:5000/";

var analyser;
var context;
let notifyConfig = {
    icon: '/favicon.png'
};

const firebaseConfig = {
    // your firebase setting
  };
function globalPeak(obj, str) {//str === "min" / max
    let peak = 0;
    let peakValue = obj[0];
    let i;
    for(i = 1; i < obj.length; i++) {
        if(str === "max") {
            if(obj[i] > peakValue) {
                peak = i;
                peakValue = obj[i];
            }
        }
        else {
            if(obj[i] < peakValue) {
                peak = i;
                peakValue = obj[i];
            }
        }
    }
    return peak;
}
let userid = "1";
firebase.initializeApp(firebaseConfig);
  
class Timer extends Component {
    constructor(props) {
        super(props);
        let tmppattern = []
        for(let i = 0; i < 49; i++) {
            tmppattern.push([parseInt(Math.random()*127), parseInt(Math.random()*127)])
        }
        this.state = {hours: 0, minutes: 0, seconds: 0, showHours: true, pomodoroMinutes: 10, pomoMinutesInput: 10, altFont: false, openLogin: false,
            width: window.innerWidth, height: window.innerHeight, pattern: tmppattern, recordingID: null, recordTime: 0,
            tmpdata: null, themeImgs: SeashoreBlue.imgs, themeName: SeashoreBlue.name, imgSize: SeashoreBlue.imgSize,
            radius: SeashoreBlue.radius, mobileimgSize: SeashoreBlue.mobileimgSize, mobileradius: SeashoreBlue.mobileradius,
            pomodoro: false, intervalId: null, isSignedIn: false, inTimer: false, pause: false, input:"", startTime: new Date()};
        this.setPomodoro = this.setPomodoro.bind(this);
        this.changeMode = this.changeMode.bind(this);
        this.changeFont = this.changeFont.bind(this);
        this.intervalHandle = null;
        this.tick = this.tick.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.pauseTimer = this.pauseTimer.bind(this);
        this.continueTimer = this.continueTimer.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.endNormal = this.endNormal.bind(this);
        this.endPomodoro = this.endPomodoro.bind(this);
        this.changePomo = this.changePomo.bind(this);
        this.resetState = this.resetState.bind(this);
        this.changeHours = this.changeHours.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.sendSigntoServer = this.sendSigntoServer.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.recordAudio = this.recordAudio.bind(this);
        this.analysisAudio = this.analysisAudio.bind(this);
        this.changeTheme = this.changeTheme.bind(this);
    }
    analysisAudio() {
        var bufferLength = analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);
        if(this.state.recordTime < 4) {
            if(this.state.recordTime === 0) {
                this.setState( (prevstate, props) => ({recordTime: prevstate.recordTime + 1, tmpdata: new Uint16Array(dataArray)}) )
                
            }
            else {
                // console.log(this.state.tmpdata);
                this.setState( (prevstate, props) => ({recordTime: prevstate.recordTime + 1, 
                    tmpdata: prevstate.tmpdata.map(function (num, idx) {return num + dataArray[idx];
                })}) )
            }
        }
        else {
            let finaldata = this.state.tmpdata.map(function (num, idx) {return num + dataArray[idx];})
            clearInterval(this.state.recordingID);
            context.close();
            let tmparray = this.state.pattern;
            tmparray.push([globalPeak(finaldata, "max"), globalPeak(finaldata, "min")])
            this.setState( (prevstate, props) => ({recordingID: null , recordTime: 0, pattern: tmparray }) )
        }        
    }
    sendNotification(message) {        
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
          }
          // Let's check whether notification permissions have alredy been granted
        else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification(message, notifyConfig);
        }
        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== 'denied' || Notification.permission === "default") {
        Notification.requestPermission(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
            var notification = new Notification(message, notifyConfig);
            }
        });
        }
    }
    recordAudio() {
        try {
            navigator.permissions.query({name:'microphone'}).then((result)=> {
                if (result.state === 'granted') {
                    // console.log("granted");
                    
                    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                    .then((stream) => {
                        window.AudioContext = window.AudioContext || window.webkitAudioContext;
                        context = new window.AudioContext();
                        var input = context.createMediaStreamSource(stream)
                        analyser = context.createAnalyser();
                        analyser.fftSize = 256;
                        input.connect(analyser);
                        let recID = setInterval(this.analysisAudio, 500);
                        this.setState( {recordingID: recID} )
                    })
                } else if (result.state === 'prompt') {
                    // console.log("prompt");
                    alert("We need to use your microphone to record your background sound, and if you denied to use the microphone, we will use random generated data.");
                    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                        .then((stream) => {
                            window.AudioContext = window.AudioContext || window.webkitAudioContext;
                            context = new window.AudioContext();
                            var input = context.createMediaStreamSource(stream)
                            analyser = context.createAnalyser();
                            analyser.fftSize = 256;
                            input.connect(analyser);
                            let recID = setInterval(this.analysisAudio, 500);
                            this.setState( {recordingID: recID} )
                        })
                        .catch((err) => {
                            let tmparray = this.state.pattern;
                            tmparray.push([ parseInt(Math.random()*127), parseInt(Math.random()*127)])
                            this.setState( (prevstate, props) => ({pattern: tmparray }) )
                        });//use random nuber
                } else if (result.state === 'denied') {
                    // console.log("denied");//use random nuber
                    let tmparray = this.state.pattern;
                    tmparray.push([ parseInt(Math.random()*127), parseInt(Math.random()*127)])
                    this.setState( (prevstate, props) => ({pattern: tmparray }) )
                }
                result.onchange = function() {
                };
            });
        }
        catch(err) {
            navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then((stream) => {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                context = new window.AudioContext();
                var input = context.createMediaStreamSource(stream)
                analyser = context.createAnalyser();
                analyser.fftSize = 256;
                input.connect(analyser);
                let recID = setInterval(this.analysisAudio, 500);
                this.setState( {recordingID: recID} )
            })
            .catch((err) => {
                let tmparray = this.state.pattern;
                tmparray.push([ parseInt(Math.random()*127), parseInt(Math.random()*127)])
                this.setState( (prevstate, props) => ({pattern: tmparray }) )
            });//use random nuber
        }
    }
    sendSigntoServer() {
        fetch( server + "user?" + queryString.stringify({
            userId: firebase.auth().currentUser.uid,
        }) , {
            method: 'GET',
        })
        .then(
            function(response) {
                response.json().then(function(data) {
                    // console.log(data);
                });
            }
        )
    }
    changeTheme(event) {
        let check = false;
        if(event.target.value === "Seashore[Blue]") {
            check = true;
            this.setState({themeImgs: SeashoreBlue.imgs, themeName: SeashoreBlue.name, imgSize: SeashoreBlue.imgSize,
                radius: SeashoreBlue.radius, mobileimgSize: SeashoreBlue.mobileimgSize, mobileradius: SeashoreBlue.mobileradius})
            
        }
        else if(event.target.value === "Seashore") {
            check = true;
            this.setState({themeImgs: Seashore.imgs, themeName: Seashore.name, imgSize: Seashore.imgSize,
                radius: Seashore.radius, mobileimgSize: Seashore.mobileimgSize, mobileradius: Seashore.mobileradius})
        }
        if(userid !== "1" && check) {
            fetch(server+ "userpref/", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                body: JSON.stringify({
                    userId: userid,
                    themeName: event.target.value,
                })
            })
            .then(
                function(response) {
                    response.json().then(function(data) {
                        // console.log(data);
                    });
                }
            )
            .catch((err) => console.log('Error :', err));    
        }
    }
    uiConfig = {
        // Popup signin flow rather than redirect flow.
        signInFlow: 'popup',
        // We will display Google and Facebook as auth providers.
        signInOptions: [
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          firebase.auth.GithubAuthProvider.PROVIDER_ID
        //   firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        callbacks: {
          // Avoid redirects after sign-in.
            signInSuccessWithAuthResult: () => {
                this.sendSigntoServer();
            }
        }
      };
    openModal (){
        this.setState({ openLogin: true })
    }
    closeModal (){
        this.setState({ openLogin: false })
    }
    updateDimensions() {
        this.setState({width: window.innerWidth, height: window.innerHeight});
    }
    componentWillMount() {
        this.updateDimensions();
    }
    componentDidMount() {
        this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(
            (user) => {
                this.setState({isSignedIn: !!user})
                if (user) {
                    userid = firebase.auth().currentUser.uid;
                    fetch( server + "userpref?" + queryString.stringify({
                        userId: firebase.auth().currentUser.uid,
                    }) , {
                        method: 'GET',
                    })
                    .then(
                        (response) => {
                            response.json().then((data)=> {                                
                                if(data.user[0].themeName === "Seashore[Blue]") {
                                    this.setState({themeImgs: SeashoreBlue.imgs, themeName: SeashoreBlue.name, imgSize: SeashoreBlue.imgSize,
                                        radius: SeashoreBlue.radius, mobileimgSize: SeashoreBlue.mobileimgSize, mobileradius: SeashoreBlue.mobileradius})
                                    
                                }
                                else if(data.user[0].themeName === "Seashore") {
                                    this.setState({themeImgs: Seashore.imgs, themeName: Seashore.name, imgSize: Seashore.imgSize,
                                        radius: Seashore.radius, mobileimgSize: Seashore.mobileimgSize, mobileradius: Seashore.mobileradius})
                                }
                                if(data.user[0].pomoMinutes !== null && data.user[0].pomoMinutes !== undefined) {
                                    if(this.state.pomodoro) {
                                        if(parseInt(data.user[0].pomoMinutes) >= 60 && this.state.showHours) {                    
                                            let minute = parseInt(data.user[0].pomoMinutes)%60;
                                            let hours = Math.floor(parseInt(data.user[0].pomoMinutes)/60);
                                            this.setState({hours: hours, minutes: minute, pomodoroMinutes: parseInt(data.user[0].pomoMinutes), pomoMinutesInput: data.user[0].pomoMinutes})
                                        }
                                        else
                                            this.setState({hours: 0, minutes: parseInt(data.user[0].pomoMinutes), pomodoroMinutes: parseInt(data.user[0].pomoMinutes), pomoMinutesInput: data.user[0].pomoMinutes})
                                    }
                                    else
                                        this.setState({pomodoroMinutes: parseInt(data.user[0].pomoMinutes), pomoMinutesInput: data.user[0].pomoMinutes})
                                }
                                if(data.user[0].showHours === true || data.user[0].showHours === false) {
                                    if(data.user[0].showHours === false) {
                                        this.setState((prevstate, props) =>({hours:0, minutes: prevstate.hours*60+prevstate.minutes, showHours: false}));
                                    }
                                    else {
                                        this.setState((prevstate, props) =>({hours: Math.floor(prevstate.minutes/60), minutes: prevstate.minutes%60, showHours: true}));
                                    }
                                }
                            });
                        }
                    )
                } else {
                    userid = "1";
                }
            }
        );
        window.addEventListener("resize", this.updateDimensions);
    }
    componentWillUnmount() {
        this.unregisterAuthObserver();
        window.removeEventListener("resize", this.updateDimensions);
      }
        
    setPomodoro(time) {
        this.setState((prevstate, props) =>({pomodoroMinutes: time}));
    }
    handleChange(event) {
        this.setState({input: event.target.value});
    }
    changePomo(event) {
        if(!this.state.inTimer || (this.state.inTimer && !this.state.pomodoro)) {
            //check input valid/not
            if(/^\+?(0|[1-9]\d*)$/.test(event.target.value) && parseInt(event.target.value) > 0 ) {
                if(this.state.pomodoro) {
                    if(parseInt(event.target.value) >= 60 && this.state.showHours) {                    
                        let minute = parseInt(event.target.value)%60;
                        let hours = Math.floor(parseInt(event.target.value)/60);
                        this.setState({hours: hours, minutes: minute, pomodoroMinutes: parseInt(event.target.value), pomoMinutesInput: event.target.value})
                    }
                    else
                        this.setState({hours: 0, minutes: parseInt(event.target.value), pomodoroMinutes: parseInt(event.target.value), pomoMinutesInput: event.target.value})
                }
                else
                    this.setState({pomodoroMinutes: parseInt(event.target.value), pomoMinutesInput: event.target.value})
                //update pref to server
                if(userid !== "1") {
                    
                    fetch(server+ "userpref/", {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json;charset=UTF-8',
                        },
                        body: JSON.stringify({
                            userId: userid,
                            pomoMinutes: parseInt(event.target.value),
                        })
                    })
                    .then(
                        function(response) {
                            response.json().then(function(data) {
                                // console.log(data);
                            });
                        }
                    )
                    .catch((err) => console.log('Error :', err));    
                }
            }
            this.setState({pomoMinutesInput: event.target.value});
        }
    }
    resetState() {
        if(this.state.recordingID)
            clearInterval(this.state.recordingID);
        if(this.state.pomodoro) {
            let hours = 0;
            let minutes = this.state.pomodoroMinutes;
            if(minutes > 60 && this.state.showHours) {
                hours++;
                minutes -= 60;
            }
            this.setState({inTimer: false, pause: false, hours: hours, minutes: minutes, seconds: 0, input:"", recordingID: null, recordTime: 0, tmpdata: null})
        }
        else {
            this.setState({inTimer: false, pause: false, hours: 0, minutes: 0, seconds: 0, input:"", recordingID: null, recordTime: 0, tmpdata: null})
        }
    }
    endNormal() {
        clearInterval(this.state.intervalId);
        let title = this.state.input;
        let startTime = this.state.startTime;
        let pattern = this.state.pattern;
        this.resetState()
        let elapse = this.state.minutes * 60 + this.state.seconds;
        if(this.state.showHours)
            elapse = this.state.hours * 3600 + this.state.minutes * 60 + this.state.seconds;
        if(this.state.pomodoro) {
            elapse = this.state.pomodoroMinutes * 60 - elapse;
        }
        fetch(server+ "task/", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                userId: userid,
                title: title,
                startTime: startTime,
                endTime: new Date(),
                elapse: elapse,
                isPomodoro: false,
                pattern: pattern
            })
        })
        .then(
            function(response) {
                response.json().then(function(data) {
                    // console.log(data);
                });
            }
        )
        .catch((err) => console.log('Error :', err));
    }

    endPomodoro() {
        this.sendNotification("Pomodoro Timer End!");
        clearInterval(this.state.intervalId);
        let title = this.state.input;
        let startTime = this.state.startTime;
        let pomoMinutes = this.state.pomodoroMinutes;
        let pattern = this.state.pattern;
        this.resetState()
        fetch(server+ "task/", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                userId: userid,
                title: title,
                startTime: startTime,
                endTime: new Date(),
                elapse: pomoMinutes*60,
                isPomodoro: true,
                pattern: pattern
            })
        })
        .then(
            function(response) {
                response.json().then(function(data) {
                    // console.log(data);
                });
            }
        )
        .catch((err) => console.log('Error :', err));
    }

    changeFont() {
        this.setState((prevstate, props) =>({altFont: !prevstate.altFont}));
    }
    changeHours() {
        let showHours = this.state.showHours;
        if(this.state.showHours) {
            this.setState((prevstate, props) =>({hours:0, minutes: prevstate.hours*60+prevstate.minutes, showHours: !prevstate.showHours}));
        }
        else {
            this.setState((prevstate, props) =>({hours: Math.floor(prevstate.minutes/60), minutes: prevstate.minutes%60, showHours: !prevstate.showHours}));
        }
        if(userid !== "1" ) {
            fetch(server+ "userpref/", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                body: JSON.stringify({
                    userId: userid,
                    showHours: !showHours,
                })
            })
            .then(
                function(response) {
                    response.json().then(function(data) {
                        // console.log(data);
                    });
                }
            )
            .catch((err) => console.log('Error :', err));    
        }
    }
    changeMode(pomodoro) {
        if(pomodoro) {
            this.setState((prevstate, props) =>({minutes: prevstate.pomodoroMinutes, pomodoro: pomodoro}));
        }
        else {
            this.setState((prevstate, props) =>({minutes: 0, pomodoro: pomodoro}));
        }
    }
    tick() {
        let elapse = this.state.minutes * 60 + this.state.seconds + 1;
        if(this.state.showHours)
            elapse = this.state.hours * 3600 + this.state.minutes * 60 + this.state.seconds + 1;
        if(this.state.pomodoro) {
            elapse = this.state.pomodoroMinutes * 60 - elapse;
        }
        if(elapse <= 20*60) {
            if(elapse % 20 === 0) {
                this.recordAudio();
            }
        }
        else if(elapse <= 40*60) {
            if(elapse % 30 === 0) {
                this.recordAudio();
            }
        }
        else {
            if(elapse % 60 === 0) {
                this.recordAudio();
            }
        }
        if(this.state.pomodoro) {//pomodoro
            if(this.state.seconds > 0) {
                this.setState((prevstate, props) =>({seconds: prevstate.seconds - 1}));
            }
            else {
                if(this.state.minutes > 0)
                    this.setState((prevstate, props) =>({minutes: prevstate.minutes - 1, seconds: 59}));
                else {
                    if(this.state.showHours && this.state.hours > 0) {
                        this.setState((prevstate, props) =>({hours: prevstate.hours - 1, minutes: 59, seconds: 59}));
                    }
                    else {
                        clearInterval(this.state.intervalId);
                        this.endPomodoro();//End Pomodoro
                    }
                }
            }
            
        }
        else {//time
            if(this.state.seconds < 59) {
                this.setState((prevstate, props) =>({seconds: prevstate.seconds + 1}));
            }
            else{
                this.setState((prevstate, props) =>({minutes: prevstate.minutes + 1, seconds: 0}))
            }
        }
    }
    startTimer() {
        if(userid !== "1") {
            var intervalId;
            intervalId = setInterval(this.tick, 1000);
            if(!this.state.inTimer)
                this.setState((prevstate, props) =>({intervalId: intervalId, inTimer: true, startTime: new Date(), pattern: []}));
            else
                this.setState((prevstate, props) =>({intervalId: intervalId, inTimer: true, startTime: new Date()}));
        }
        else {
            alert("You have to sign in to record you time.");
        }
    }
    pauseTimer() {
        clearInterval(this.state.intervalId);
        this.setState((prevstate, props) =>({pause: true}));
    }
    continueTimer() {
        var intervalId;
        intervalId = setInterval(this.tick, 1000);
        this.setState((prevstate, props) =>({intervalId: intervalId, pause: false}));
    }
    render() {
        let userBlock;
        let signStatus;
        let line;
        if(this.state.isSignedIn && this.state.openLogin) {
            this.closeModal();
        }
        if(!this.state.isSignedIn) {
            userBlock = <div className="profileContainer">
                <div className="profileItem">
                    <img src="/img/stranger.png" alt="profile" />
                </div>
                <div className="profileItem">
                    <span className="welcomeStranger">
                        Hello,
                    </span>
                    <span className="welcomeStranger">
                        Stranger.
                    </span>
                </div>
            </div>
            signStatus = <Popup open={this.state.openLogin} trigger={<button className="munuButton" onClick={this.openModal}>Sign in</button>} modal 
            onClose={this.closeModal} closeOnDocumentClick>
                <StyledFirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()} />
            </Popup>;
            line = <div className="splitLine"></div>;
        }
        else {
            userBlock = <div className="profileContainer">
                    <div className="profileItem">
                        <img src={firebase.auth().currentUser.photoURL} alt="profile" />
                    </div>
                    <div className="profileItem">
                        <span className="displayName">
                            {firebase.auth().currentUser.displayName}
                        </span>
                        <span className="email">
                            {firebase.auth().currentUser.email}
                        </span>
                    </div>
                </div>;
            signStatus = <button className="munuButton" onClick={() => firebase.auth().signOut()}>Sign out</button>;
            line = <div className="splitLine"></div>;
        }
        let font = "tradFont";
        if(!this.state.altFont) {
        font = "modernFont";
        }
        return (
            <div className={font} id="outer-container">
                <MediaQuery query="(min-width: 900px)">
                    <div className = "background">
                        <P5Wrapper sketch={sketch} width={this.state.width} height={this.state.height} pattern={this.state.pattern} imgSize={this.state.imgSize} imgs={this.state.themeImgs} radius={this.state.radius}/>
                    </div>
                    <Menu burgerButtonClassName={ "bm-burger-button-normal" } outerContainerId={ "outer-container" } customBurgerIcon={ <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="45" height="32" viewBox="0 0 45 32">
                        <g id="Component_1_1" data-name="Component 1 – 1">
                            <rect id="Rectangle_1" data-name="Rectangle 1" width="45" height="4"/>
                            <rect id="Rectangle_2" data-name="Rectangle 2" width="45" height="4" transform="translate(0 28)"/>
                            <rect id="Rectangle_3" data-name="Rectangle 3" width="45" height="4" transform="translate(0 14)"/>
                        </g>
                        </svg>
                    } >
                        <div>
                            {userBlock}
                        </div>
                        {line}
                        <NavLink to="/Home" >Home</NavLink>
                        <NavLink to="/settings">Settings</NavLink>
                        <NavLink to="/statistics">Statistics</NavLink>
                        {signStatus}
                        <div className="githubLink">If you have any suggestion or encounter any problem, feel free to submit an issue on <a href="https://github.com/zakmit/Life-Recorder">github</a>.</div>
                    </Menu>
                </MediaQuery>
                <MediaQuery query="(max-width: 900px)">
                    <div className = "background">
                        <P5Wrapper sketch={sketch} width={this.state.width} height={this.state.height} pattern={this.state.pattern} imgSize={this.state.mobileimgSize} imgs={this.state.themeImgs} radius={this.state.mobileradius}/>
                    </div>
                    <Menu width={ 260 } burgerButtonClassName={ "bm-burger-button-protrait" } outerContainerId={ "outer-container" } customBurgerIcon={ <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="45" height="32" viewBox="0 0 45 32">
                        <g id="Component_1_1" data-name="Component 1 – 1">
                            <rect id="Rectangle_1" data-name="Rectangle 1" width="45" height="4"/>
                            <rect id="Rectangle_2" data-name="Rectangle 2" width="45" height="4" transform="translate(0 28)"/>
                            <rect id="Rectangle_3" data-name="Rectangle 3" width="45" height="4" transform="translate(0 14)"/>
                        </g>
                        </svg>
                    } >
                        <div>
                            {userBlock}
                        </div>
                        {line}
                        <NavLink to="/Home" >Home</NavLink>
                        <NavLink to="/settings">Settings</NavLink>
                        <NavLink to="/statistics">Statistics</NavLink>
                        {signStatus}
                        <div className="githubLink">If you have any suggestion or encounter any problem, feel free to submit an issue on <a href="https://github.com/zakmit/Life-Recorder">github</a>.</div>
                    </Menu>
                </MediaQuery>

                
                <Switch>
                    <Route exact path="/settings" render={(props) => <Settings {...props} fontBool={this.state.altFont} changeFont={this.changeFont}
                    hours={this.state.hours} minutes={this.state.minutes} seconds={this.state.seconds} showHours={this.state.showHours}
                    pomoMinutes={this.state.pomoMinutesInput} changePomo={this.changePomo} changeHours={this.changeHours} changeTheme={this.changeTheme}
                    themeName={this.state.themeName}/>} />

                    <Route path="/statistics" render={(props) => <Statistics {...props} userId={userid} server={server}
                    hours={this.state.hours} minutes={this.state.minutes} seconds={this.state.seconds} showHours={this.state.showHours}
                    imgSize={this.state.imgSize} themeImgs={this.state.themeImgs} radius={this.state.radius}/>} />

                    <Redirect from="/home" to="/" />
                    <Route path="/" render={(props) => <Home {...props} hours={this.state.hours} minutes={this.state.minutes}
                    seconds={this.state.seconds} showHours={this.state.showHours} startTimer={this.startTimer} pause={this.state.pause}
                    changeMode={this.changeMode} checkBoxValue={this.state.pomodoro} inTimer={this.state.inTimer} pauseTimer={this.pauseTimer} endTimer={this.endNormal}
                    continueTimer={this.continueTimer} handleChange={this.handleChange} input={this.state.input}/>} />
                </Switch>
            </div>
        )
    }
}

export default Timer;
