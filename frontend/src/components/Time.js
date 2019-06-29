import React from "react";

function Timein(props) {
    let hours = ("0" + props.hours).slice(-2)
    if(props.hours >= 100) {
        hours = props.hours
    }
    // console.log(props.minutes);
    let minutes = ("0" + props.minutes).slice(-2)
    if(props.minutes >= 100) {
        minutes = props.minutes
    }
    if (props.showHours) {
        return (<div className="TimeDiv">
            <div className="Hours">
                {hours}
            </div>
            <span className="Colon">
                :
            </span>
            <div className="Minutes">
                {minutes}
            </div>
            <span className="Colon">
                :
            </span>
            <div className="Seconds">
                {("0" + props.seconds).slice(-2)}
            </div>
        </div>)
    }
    return (<div className="TimeDiv">
        <div className="Minutes">
            {minutes}
        </div>
        <div className="Colon">
            :
        </div>
        <div className="Seconds">
            {("0" + props.seconds).slice(-2)}
        </div>
    </div>);
}
export default ({ hours, minutes, seconds, showHours }) => {
    return (
        <Timein hours={hours} minutes={minutes} seconds={seconds} showHours={showHours} />
    )
}