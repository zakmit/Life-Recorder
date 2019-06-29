import React, { Component } from 'react'

class MonthPicker extends Component {
    constructor(props) {
        super(props);
        this.state = {year: this.props.value.year}
        this.setMonthYear = this.setMonthYear.bind(this);
        this.lastYear = this.lastYear.bind(this);
        this.nextYear = this.nextYear.bind(this);
    }
    lastYear() {
        if(this.state.year > 2019)
            this.setState((prevState) => ({year: prevState.year - 1}) );
    }
    nextYear() {
        if(this.state.year < 2038)
            this.setState((prevState) => ({year: prevState.year + 1}) );
    }
    setMonthYear(month) {
        this.props.onChange({year: this.state.year, month: month})
    }
    render() {
        let monthList = this.props.lang.months.map((month) => {
                let Now = new Date();
                if(this.state.year === this.props.value.year && this.props.value.month === month[1]){ //selected
                    if(this.state.year === Now.getFullYear() && month[1] === Now.getMonth())
                        return <div key={month[1]} className="monthPickerMonthSelected currentSelMonth" onClick={() => this.setMonthYear(month[1])}>{month[0]}</div>;
                    return <div key={month[1]} className="monthPickerMonthSelected" onClick={() => this.setMonthYear(month[1])}>{month[0]}</div>;
                }
                if(this.state.year === Now.getFullYear() && month[1] === Now.getMonth())
                    return <div key={month[1]} className="monthPickerMonth currentMonth" onClick={() => this.setMonthYear(month[1])}>{month[0]}</div>;
                return <div key={month[1]} className="monthPickerMonth" onClick={() => this.setMonthYear(month[1])}>{month[0]}</div>;
            }
        );
        return <div className="monthPickerOuter">
            <div className="monthPickerYear">
                <button className="prevYear" onClick={this.lastYear}>&lt;</button>
                <span>{this.state.year}</span>
                <button className="nextYear" onClick={this.nextYear}>&gt;</button>
            </div>
            <div className="monthPickerMonths">
                {monthList}
            </div>
        </div>
    }
}
export default MonthPicker;