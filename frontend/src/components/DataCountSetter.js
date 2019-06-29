import React, { Component } from 'react'
const rightBorder = {
    borderRight: "1px solid rgb(194, 200, 202)"
}

class DataCountSetter extends Component {
    constructor(props) {
        super(props);
        this.setCountType = this.setCountType.bind(this);
    }
    setCountType(value) {
        this.props.setCountType(value);
    }
    render() {
        let eventButton = <button className="countButton" style={rightBorder} onClick={() => this.setCountType(0)}>Event</button>
        let dayButton = (this.props.optionType > 1)? <button className="countButton" style={rightBorder} onClick={() => this.setCountType(1)}>Day</button>
         : <button className="countButton" onClick={() => this.setCountType(1)}>Day</button>
        if(this.props.countType === 0) {
            eventButton = <button className="countButtonSel" style={rightBorder}>Event</button>
        }
        else if(this.props.countType === 1) {
            dayButton = (this.props.optionType > 1)? <button className="countButtonSel" style={rightBorder} onClick={() => this.setCountType(1)}>Day</button>
            : <button className="countButtonSel" onClick={() => this.setCountType(1)}>Day</button>
        }
        let weekButton;
        let monthButton;
        if(this.props.optionType > 1) {
            if(this.props.countType === 2)
                weekButton = <button className="countButtonSel">Week</button>
            else
                weekButton = <button className="countButton" onClick={() => this.setCountType(2)}>Week</button>
        }
        if(this.props.optionType > 2) {
            if(this.props.countType === 2) {
                weekButton = <button className="countButtonSel" style={rightBorder}>Week</button>
                monthButton = <button className="countButton" onClick={() => this.setCountType(3)}>Month</button>
            }
            if(this.props.countType === 3) {
                weekButton = <button className="countButton" style={rightBorder} onClick={() => this.setCountType(2)}>Week</button>
                monthButton = <button className="countButtonSel">Month</button>
            }
            else {
                weekButton = <button className="countButton" style={rightBorder} onClick={() => this.setCountType(2)}>Week</button>
                monthButton = <button className="countButton" onClick={() => this.setCountType(3)}>Month</button>
            }
        }
        return <span className="dataCountSetter">
            {eventButton}
            {dayButton}
            {weekButton}
            {monthButton}
        </span>
        }
}
export default DataCountSetter;