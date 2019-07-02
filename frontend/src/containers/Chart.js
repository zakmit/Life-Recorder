import React, { Component } from 'react'
import queryString from 'query-string'
import moment from 'moment'
import DayPicker, { DateUtils } from 'react-day-picker';
import MediaQuery from 'react-responsive';
import MonthPicker from '../components/MonthPicker'
import DataCountSetter from '../components/DataCountSetter'
import 'react-day-picker/lib/style.css';
import {
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend
  } from 'recharts';
import { timeToString } from '../script/timeToString';

// import MediaQuery from 'react-responsive'

function getWeekDays(weekStart) {
    const days = [weekStart];
    for (let i = 1; i < 7; i += 1) {
      days.push(
        moment(weekStart)
          .add(i, 'days')
          .toDate()
      );
    }
    return days;
  }
  
function getWeekRange(date) {
    return {
      from: moment(date)
        .startOf('week')
        .toDate(),
      to: moment(date)
        .endOf('week')
        .toDate(),
    };
}

function sortByName(a, b) {
    if(a.title < b.title){
        return -1;
    }
    if(a.title > b.title) {
        return 1;
    }
    return 0;
}

function sortByTime(a, b) {
    let aDate = new Date(a.startTime);
    let bDate = new Date(b.startTime);
    if(aDate < bDate){
        return -1;
    }
    if(aDate > bDate) {
        return 1;
    }
    return 0;
}

function sortByElapse(a, b) {
    if(a.elapse > b.elapse){
        return -1;
    }
    if(a.elapse < b.elapse) {
        return 1;
    }
    if(a.count > b.count){
        return -1;
    }
    if(a.count < b.count) {
        return 1;
    }
    return 0;
}

class Chart extends Component {
    fetchData(startDate, endDate) {
        let rawdata;        
        fetch(this.props.server+ "task?" + queryString.stringify({
            userId: this.props.userId,
            startDate: startDate,
            endDate: endDate
        }), {
            method: 'GET',
        })
        .then(res => res.json())
        .then(data => rawdata = data)
        .then(() => {
            //Deal with Record
            
            let totalTime = [];
            let timeDescription = "Start tracking your time to view the statistics.";
            let totalElapse = 0;
            let totalCount = 0;
            
            let totalPomoCount = 0;
            let tmp = null;
            if(this.state.chartCountType === 0) {
                rawdata.sort(sortByName);
                for(let i = 0; i < rawdata.length; i++) {
                    if( tmp === null) {
                        tmp = { elapse: rawdata[i].elapse, title: rawdata[i].title, count: 1};
                        continue;
                    }
                    if( rawdata[i].title === tmp.title) {
                        tmp.count += 1;
                        tmp.elapse += rawdata[i].elapse;
                    }
                    else {
                        totalTime.push(tmp);
                        totalElapse += tmp.elapse;
                        totalCount += tmp.count;
                        tmp = { elapse: rawdata[i].elapse, title: rawdata[i].title, count: 1};
                    }
                }
            }
            else if(this.state.chartCountType === 1) {
                rawdata.sort(sortByTime);
                for(let i = 0; i < rawdata.length; i++) {
                    let tmpTime = new Date(rawdata[i].startTime);
                    if( tmp === null) {
                        tmp = { elapse: rawdata[i].elapse, title: tmpTime.toLocaleDateString(), count: 1};
                        continue;
                    }
                    if( tmpTime.toLocaleDateString() === tmp.title) {
                        tmp.count += 1;
                        tmp.elapse += rawdata[i].elapse;
                    }
                    else {
                        totalTime.push(tmp);
                        totalElapse += tmp.elapse;
                        totalCount += tmp.count;
                        let tmpTime = new Date(rawdata[i].startTime);
                        tmp = { elapse: rawdata[i].elapse, title: tmpTime.toLocaleDateString(), count: 1};
                    }
                }
            }
            else if(this.state.chartCountType === 2) {
                rawdata.sort(sortByTime);
                for(let i = 0; i < rawdata.length; i++) {
                    let tmpTime = new Date(rawdata[i].startTime);
                    let week = moment(tmpTime).format('w')
                    if( tmp === null) {
                        tmp = { elapse: rawdata[i].elapse, title: week, count: 1};
                        continue;
                    }
                    if( week === tmp.title) {
                        tmp.count += 1;
                        tmp.elapse += rawdata[i].elapse;
                    }
                    else {
                        totalTime.push(tmp);
                        totalElapse += tmp.elapse;
                        totalCount += tmp.count;
                        tmp = { elapse: rawdata[i].elapse, title: week, count: 1};
                    }
                }
            }
            else if(this.state.chartCountType === 3) {
                rawdata.sort(sortByTime);
                for(let i = 0; i < rawdata.length; i++) {
                    let tmpTime = new Date(rawdata[i].startTime);
                    if( tmp === null) {
                        tmp = { elapse: rawdata[i].elapse, title: tmpTime.getFullYear() + "/" + tmpTime.getMonth(), count: 1};
                        continue;
                    }
                    if( tmpTime.getFullYear() + "/" + tmpTime.getMonth() === tmp.title) {
                        tmp.count += 1;
                        tmp.elapse += rawdata[i].elapse;
                    }
                    else {
                        totalTime.push(tmp);
                        totalElapse += tmp.elapse;
                        totalCount += tmp.count;
                        tmp = { elapse: rawdata[i].elapse, title: tmpTime.getFullYear() + "/" + tmpTime.getMonth(), count: 1};
                    }
                }
            }
            if(tmp !== null) {
                totalElapse += tmp.elapse;
                totalCount += tmp.count;
                totalTime.push(tmp);
            }
            if(this.state.chartCountType === 0)
                totalTime.sort(sortByElapse);
            //Deal with Pomodoro Count
            
            let tmp2 = null;
            let totalPomo = [];
            if(this.state.pomoCountType === 0) {
                rawdata.sort(sortByName);
                for(let i = 0; i < rawdata.length; i++) {
                    if(rawdata[i].isPomodoro) {
                        if(tmp2 === null) {
                            tmp2 = { Date: rawdata[i].title, Count: 1};
                        }
                        else {
                            if(rawdata[i].title === tmp2.Date) {
                                tmp2.Count ++;
                            }
                            else {
                                totalPomo.push(tmp2);
                                totalPomoCount += tmp2.Count;
                                tmp2 = { Date: rawdata[i].title, Count: 1};
                            }
                        }
                    }
                }
            }
            else if(this.state.pomoCountType === 1) {
                rawdata.sort(sortByTime);
                for(let i = 0; i < rawdata.length; i++) {
                    if(rawdata[i].isPomodoro) {
                        if(tmp2 === null) {
                            let A = new Date(rawdata[i].startTime);
                            tmp2 = { Date: A.toLocaleDateString(), Count: 1};
                        }
                        else {
                            let A = new Date(rawdata[i].startTime);
                            if(A.toLocaleDateString() === tmp2.Date) {
                                tmp2.Count ++;
                            }
                            else {
                                totalPomo.push(tmp2);
                                totalPomoCount += tmp2.Count;
                                tmp2 = { Date: A.toLocaleDateString(), Count: 1};
                            }
                        }
                    }
                }
            }
            else if(this.state.pomoCountType === 2) {
                rawdata.sort(sortByTime);
                for(let i = 0; i < rawdata.length; i++) {
                    if(rawdata[i].isPomodoro) {
                        let tmpTime = new Date(rawdata[i].startTime);
                        let week = moment(tmpTime).format('w')
                        if(tmp2 === null) {
                            tmp2 = { Date: week, Count: 1};
                        }
                        else {
                            if(week === tmp2.Date) {
                                tmp2.Count ++;
                            }
                            else {
                                totalPomo.push(tmp2);
                                totalPomoCount += tmp2.Count;
                                tmp2 = { Date: week, Count: 1};
                            }
                        }
                    }
                }
            }
            else if(this.state.pomoCountType === 3) {
                rawdata.sort(sortByTime);
                for(let i = 0; i < rawdata.length; i++) {
                    if(rawdata[i].isPomodoro) {
                        let tmpTime = new Date(rawdata[i].startTime);
                        if(tmp2 === null) {
                            tmp2 = { Date: tmpTime.getFullYear() + "/" + tmpTime.getMonth(), Count: 1};
                        }
                        else {
                            if(tmpTime.getFullYear() + "/" + tmpTime.getMonth() === tmp2.Date) {
                                tmp2.Count ++;
                            }
                            else {
                                totalPomo.push(tmp2);
                                totalPomoCount += tmp2.Count;
                                tmp2 = { Date: tmpTime.getFullYear() + "/" + tmpTime.getMonth(), Count: 1};
                            }
                        }
                    }
                }
            }
            if(tmp2 !== null) {
                totalPomo.push(tmp2);
                totalPomoCount += tmp2.Count;
            }
            if(totalElapse >= 12*60*60) {
                timeDescription = "Wow, it's more than half a day!";
            }
            else if(totalElapse >= 8*60*60) {
                timeDescription = "That's amazing!";
            }
            else if(totalElapse >= 4*60*60) {
                timeDescription = "Quiet a lot time have been tracked.";
            }
            else if(totalElapse >= 2*60*60) {
                timeDescription = "Well begun is half done.";
            }
            else if(totalElapse > 0) {
                timeDescription = "A tiny step of time tracking is always a good place to start.";
            }
            else {
                timeDescription = "Start tracking your time to view the statistics.";
            }
            totalElapse = timeToString(totalElapse);
            this.setState({totalElapse: totalElapse, elapseChartData: totalTime, pomoChartData: totalPomo, totalCount: totalCount, timeDescription: timeDescription,
            totalPomo: totalPomoCount});
            
        })//modified data
    }
    constructor(props) {
        super(props);
        let today = new Date();
        this.state = { tablepart: "", chartType: 0, //0 for day, 1 for week, 2 for month, 3 for year
        weekDays: [], hoverRange: undefined, totalPomo: 0, yearInput: today.getFullYear(), year: today.getFullYear(),
        date: new Date(), focused: false, startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()) , chartCountType: 0, //0 for event, 1 for days, 2 for week, 3 for month
        pomoCountType: 0, from: new Date(today.getFullYear(), today.getMonth(), today.getDate()), to: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        fromInput: today.toLocaleDateString(), toInput: today.toLocaleDateString(),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1), elapseChartData: null, pomoChartData: null,
        timeDescription: "Start tracking your time to view the statistics.", totalElapse: "Nothing", totalCount: 0, dateInput: today.toLocaleDateString(),
        monthPicker: {year: today.getFullYear(), month: today.getMonth()},
        }
        //bind function
        this.changeWeeks = this.changeWeeks.bind(this);
        this.changeDays = this.changeDays.bind(this);
        this.changeMonths = this.changeMonths.bind(this);
        this.changeYears = this.changeYears.bind(this);
        this.handleDayClick = this.handleDayClick.bind(this);
        this.handleDayInput = this.handleDayInput.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.changeCustom = this.changeCustom.bind(this);
        //bind week
        this.handleWeekDaysChange = this.handleWeekDaysChange.bind(this);
        this.handleWeekDayEnter = this.handleWeekDayEnter.bind(this);
        this.handleWeekDayLeave = this.handleWeekDayLeave.bind(this);
        this.handleWeekClick = this.handleWeekClick.bind(this);
        //bind month
        this.handleAMonthChange = this.handleAMonthChange.bind(this);
        this.handleClickMonthBox = this.handleClickMonthBox.bind(this);
        this.lastYear = this.lastYear.bind(this);
        this.nextYear = this.nextYear.bind(this);
        this.handleYearInput = this.handleYearInput.bind(this);
        this.handleYearChange = this.handleYearChange.bind(this);
        //bind Custom
        this.handleCustomDayClick = this.handleCustomDayClick.bind(this);
        this.handlefromInput = this.handlefromInput.bind(this);
        this.handletoInput = this.handletoInput.bind(this);
        //chartCountType
        this.changeChartCountType = this.changeChartCountType.bind(this);
        this.changePomoCountType = this.changePomoCountType.bind(this);
        this.fetchData(new Date(today.getFullYear(), today.getMonth(), today.getDate()), new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));
    }
    //Change Mode
    changeDays() {
        this.setState((prevstate, props) =>({chartType: 0, chartCountType: 0}));
        let today = new Date(this.state.date);
        this.fetchData(new Date(today.getFullYear(), today.getMonth(), today.getDate()), new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));
    }
    changeWeeks() {
        if(this.state.chartCountType >= 2) {
            this.setState((prevstate, props) =>({chartType: 1, chartCountType: 0}));
        }
        else
            this.setState((prevstate, props) =>({chartType: 1}));
        let today = new Date();
        this.handleWeekDaysChange(today);
    }
    changeMonths() {
        if(this.state.chartCountType >= 3) {
            this.setState((prevstate, props) =>({chartType: 2, chartCountType: 0}));
        }
        else
            this.setState((prevstate, props) =>({chartType: 2}));
        let today = new Date();
        this.handleAMonthChange({year: today.getFullYear(), month: today.getMonth()})
    }
    changeYears() {
        this.setState((prevstate, props) =>({chartType: 3}));
        let today = new Date();
        this.handleYearChange(parseInt(today.getFullYear()));
    }
    changeCustom() {
        let endDate = new Date(this.state.to);
        endDate.setDate(endDate.getDate() + 1);
        this.setState((prevstate, props) =>({startDate: prevstate.from, endDate: endDate, chartType: 4}));
        this.fetchData(this.state.from, endDate);
    }
    //Day
    handleDayInput(event) {
        this.setState({dateInput: event.target.value});
        let m = moment(event.target.value);
        if(m.isValid() && m.isSameOrBefore(new Date())) {            
            this.handleDayClick(new Date(m));
        }
    }
    handleDayClick(date) {
        let m = moment(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
        if(m.isSameOrBefore(new Date())) {
            this.setState({
                date: date,
                dateInput: date.toLocaleDateString(),
                startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
            });
                this.fetchData(new Date(date.getFullYear(), date.getMonth(), date.getDate()), new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1));
        }
    }
    //Week
    handleWeekDaysChange = date => {
        let days = getWeekDays(getWeekRange(date).from)
        this.setState({
            weekDays: days,
            startDate: new Date(days[0].getFullYear(), days[0].getMonth(), days[0].getDate()),
            endDate: new Date(days[days.length - 1].getFullYear(), days[days.length - 1].getMonth(), days[days.length - 1].getDate() + 1)
        });
        this.fetchData(new Date(days[0].getFullYear(), days[0].getMonth(), days[0].getDate()), new Date(days[days.length - 1].getFullYear(), days[days.length - 1].getMonth(), days[days.length - 1].getDate() + 1));
    };
    handleWeekDayEnter = date => {
        this.setState({
          hoverRange: getWeekRange(date),
        });
      };
    
    handleWeekDayLeave = () => {
        this.setState({
          hoverRange: undefined,
        });
    };
    handleWeekClick = (weekNumber, days, e) => {
        
        this.setState({
            weekDays: days,
            startDate: new Date(days[0].getFullYear(), days[0].getMonth(), days[0].getDate()),
            endDate: new Date(days[days.length - 1].getFullYear(), days[days.length - 1].getMonth(), days[days.length - 1].getDate() + 1)
        });
        this.fetchData(new Date(days[0].getFullYear(), days[0].getMonth(), days[0].getDate()), new Date(days[days.length - 1].getFullYear(), days[days.length - 1].getMonth(), days[days.length - 1].getDate() + 1));
    };

    //Month
    handleClickMonthBox(e) {
        // this.refs.pickAMonth.show()
    }
    handleAMonthChange(value) {        
        this.setState({
            monthPicker: {year: value.year, month: value.month},
            startDate: new Date(value.year, value.month, 1),
            endDate: new Date(value.year, value.month + 1, 1)
        });
        this.fetchData(new Date(value.year, value.month, 1), new Date(value.year, value.month + 1, 1));
    }
    //Year
    lastYear() {
        if( parseInt(this.state.year) > 2019)
            this.handleYearChange(parseInt(this.state.year) - 1);
    }
    nextYear() {
        if(parseInt(this.state.year) < 2038)
            this.handleYearChange(parseInt(this.state.year) + 1);
    }
    handleYearInput(event) {
        this.setState({yearInput: event.target.value});
        if(parseInt(this.state.year) > 2018 && parseInt(this.state.year) < 2038) {            
            this.handleYearChange(parseInt(this.state.year));
        }
    }
    handleYearChange(value) {
        
        this.setState((prevState) => ({year: value, yearInput: value,
            startDate: new Date(value, 0, 1),
            endDate: new Date(value + 1, 0, 1)}) );
        this.fetchData(new Date(value, 0, 1), new Date(value + 1, 0, 1))
    }
    //Custom
    handleCustomDayClick(day) {
        const range = DateUtils.addDayToRange(day, this.state);
        console.log(range);
        if(range.from !== null && range.to !== null) {
            let endDate = new Date(range.to);
            endDate.setDate(endDate.getDate()+1);
            this.setState({from: range.from, to: range.to, fromInput: range.from.toLocaleDateString(),
                toInput: range.to.toLocaleDateString(), startDate:range.from, endDate: endDate});
            this.fetchData(range.from, endDate);
        }
    }
    handlefromInput(event) {
        this.setState({fromInput: event.target.value});
        let m = moment(event.target.value);
        if(m.isValid() && m.isSameOrBefore(this.state.to)) {            
            this.setState({from: new Date(m), startDate: new Date(m)});
            this.fetchData(new Date(m), this.state.endDate);
        }
    }
    handletoInput(event) {
        this.setState({toInput: event.target.value});
        let m = moment(event.target.value);
        if(m.isValid() && m.isSameOrAfter(this.state.from)) {  
            let tmpDate = new Date(m);  
            let endDate = new Date(tmpDate);
            endDate.setDate(endDate.getDate()+1);
            this.setState({to: tmpDate, endDate: endDate });
            this.fetchData(this.state.startDate, endDate);
        }
    }
    changeChartCountType(value) {
        this.setState({chartCountType: value})
        this.fetchData(this.state.startDate, this.state.endDate);
    }
    changePomoCountType(value) {
        this.setState({pomoCountType: value})
        this.fetchData(this.state.startDate, this.state.endDate);
    }
    render() {
        let pickerLang = {
            months: [ ['Jan', 0], ['Feb', 1], ['Mar', 2], ['Apr', 3], ['May', 4], ['Jun', 5], ['Jul', 6], ['Aug', 7], ['Sep', 8], ['Oct', 9], ['Nov', 10], ['Dec', 11]]
            , from: 'From', to: 'To'
        }
        let makeText = m => {            
            if (m && m.year && m.month + 1) return (pickerLang.months[m.month][0] + '. ' + m.year)
            return '?'
        }
        const { hoverRange, weekDays } = this.state;
        const daysAreSelected = weekDays.length > 0;
        const modifiers = {
            hoverRange,
            selectedRange: daysAreSelected && {
              from: weekDays[0],
              to: weekDays[6],
            },
            hoverRangeStart: hoverRange && hoverRange.from,
            hoverRangeEnd: hoverRange && hoverRange.to,
            selectedRangeStart: daysAreSelected && weekDays[0],
            selectedRangeEnd: daysAreSelected && weekDays[6],
          };
        let datePicker;
        let dateInput;
        let firstChartDes;
        let firstChartType;
        let firstChartSupDes = this.state.totalCount > 0 ? <p className="chartSup">
            By the way, there're {this.state.totalCount} timers.
        </p>: null;
        let secondChartDes;
        let secondChartType;
        let timerChart = (this.state.elapseChartData === null || this.state.elapseChartData.length === 0)? null :
            <ComposedChart
                width={500}
                height={400}
                data={this.state.elapseChartData}
                margin={{
                top: 20, right: 20, bottom: 20, left: 20,
                }}
            >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="title" />
                <YAxis yAxisId="left"/>
                <YAxis yAxisId="right" orientation='right'/>
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="elapse" barSize={20} fill="#67b1d6" />
                <Line yAxisId="right" type="monotone" dataKey="count" stroke="#faad55" />
            </ComposedChart>;
        let timerChartPro = (this.state.elapseChartData === null || this.state.elapseChartData.length === 0)? null :
        <ComposedChart
            width={300}
            height={240}
            data={this.state.elapseChartData}
            margin={{
            top: 20, right: 20, bottom: 20, left: 20,
            }}
        >
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis dataKey="title" />
            <YAxis yAxisId="left"/>
            <YAxis yAxisId="right" orientation='right'/>
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="elapse" barSize={20} fill="#67b1d6" />
            <Line yAxisId="right" type="monotone" dataKey="count" stroke="#faad55" />
        </ComposedChart>;
        let pomoChart = (this.state.pomoChartData === null || this.state.pomoChartData.length === 0)? null :
            <ComposedChart
                width={500}
                height={400}
                data={this.state.pomoChartData}
                margin={{
                top: 20, right: 20, bottom: 20, left: 20,
                }}
            >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="Date" />
                <YAxis yAxisId="left"/>
                <Tooltip />
                <Bar yAxisId="left" dataKey="Count" barSize={20} fill="#e04848" />
            </ComposedChart>
            let pomoChartPro = (this.state.pomoChartData === null || this.state.pomoChartData.length === 0)? null :
            <ComposedChart
                width={300}
                height={240}
                data={this.state.pomoChartData}
                margin={{
                top: 20, right: 20, bottom: 20, left: 20,
                }}
            >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="Date" />
                <YAxis yAxisId="left"/>
                <Tooltip />
                <Bar yAxisId="left" dataKey="Count" barSize={20} fill="#e04848" />
            </ComposedChart>
        let timeButton = <div className="timeOut">
            <button className="timeButton" onClick={this.changeDays}>Day</button>
            <button className="timeButton" onClick={this.changeWeeks}>Week</button>
            <button className="timeButton" onClick={this.changeMonths}>Month</button>
            <button className="timeButton" onClick={this.changeYears}>Year</button>
            <button className="timeButton" onClick={this.changeCustom}>Custom</button>
        </div>;
        if(this.state.chartType === 0) {
            datePicker = <div className="dayPicker"><DayPicker
                selectedDays={this.state.date}
                onDayClick={this.handleDayClick}
                disabledDays={[
                    {after: new Date()}
                ]}
            /></div>
            dateInput = <input className="timeInput" placeholder={this.state.date.toLocaleDateString()} value={this.state.dateInput} 
            onChange={this.handleDayInput}
            />
            timeButton = <div className="timeOut">
                <button className="timeButtonPress">Day</button>
                <button className="timeButton" onClick={this.changeWeeks}>Week</button>
                <button className="timeButton" onClick={this.changeMonths}>Month</button>
                <button className="timeButton" onClick={this.changeYears}>Year</button>
                <button className="timeButton" onClick={this.changeCustom}>Custom</button>
            </div>;
            firstChartDes = <p className="chartSup">
                {this.state.totalElapse} have been tracked in <b>{this.state.date.toLocaleDateString()}</b>. {this.state.timeDescription}
            </p>
        }
        else if(this.state.chartType === 1) {//Week
            firstChartType = (this.state.elapseChartData === null || this.state.elapseChartData.length === 0)? null :<DataCountSetter setCountType={this.changeChartCountType} optionType={1} countType={this.state.chartCountType}/>
            datePicker = <div className="weekPicker"> <DayPicker
                selectedDays={this.state.weekDays}
                showWeekNumbers
                showOutsideDays
                modifiers={modifiers}
                onDayClick={this.handleWeekDaysChange}
                onDayMouseEnter={this.handleWeekDayEnter}
                onDayMouseLeave={this.handleWeekDayLeave}
                onWeekClick={this.handleWeekClick}
            /></div>
            timeButton = <div className="timeOut">
                <button className="timeButton" onClick={this.changeDays}>Day</button>
                <button className="timeButtonPress">Week</button>
                <button className="timeButton" onClick={this.changeMonths}>Month</button>
                <button className="timeButton" onClick={this.changeYears}>Year</button>
                <button className="timeButton" onClick={this.changeCustom}>Custom</button>
            </div>;
            firstChartDes = <p className="chartSup">
                {this.state.totalElapse} have been tracked between <b>{this.state.startDate.toLocaleDateString()} - { (new Date(this.state.endDate.getFullYear(), this.state.endDate.getMonth(), this.state.endDate.getDate() - 1)).toLocaleDateString()}</b>.
            </p>
            secondChartType = (this.state.pomoChartData === null || this.state.pomoChartData.length === 0)? null :<DataCountSetter setCountType={this.changePomoCountType} optionType={1} countType={this.state.pomoCountType}/>
            secondChartDes = <p className="chartSup">
                Between <b>{this.state.startDate.toLocaleDateString()} - { (new Date(this.state.endDate.getFullYear(), this.state.endDate.getMonth(), this.state.endDate.getDate() - 1)).toLocaleDateString()}</b>, you have done {this.state.totalPomo} Pomodoro Timers.
            </p>
        }
        else if(this.state.chartType === 2)//Month
        {
            firstChartType = (this.state.elapseChartData === null || this.state.elapseChartData.length === 0)? null :<DataCountSetter setCountType={this.changeChartCountType} optionType={2} countType={this.state.chartCountType}/>
            timeButton = <div className="timeOut">
                <button className="timeButton" onClick={this.changeDays}>Day</button>
                <button className="timeButton" onClick={this.changeWeeks}>Week</button>
                <button className="timeButtonPress">Month</button>
                <button className="timeButton" onClick={this.changeYears}>Year</button>
                <button className="timeButton" onClick={this.changeCustom}>Custom</button>
            </div>;
            dateInput = <input className="timeInput" value={makeText(this.state.monthPicker)} readOnly onClick={this.handleClickMonthBox} />
            datePicker = <MonthPicker
                years={{min: 2019, max: 2038}}
                value={this.state.monthPicker}
                lang={pickerLang}
                onChange={this.handleAMonthChange}
                />
            firstChartDes = <p className="chartSup">
                {this.state.totalElapse} have been tracked in <b>{makeText(this.state.monthPicker)}</b>.
            </p>
            secondChartDes = <p className="chartSup">
                You have done {this.state.totalPomo} Pomodoro Timers in <b>{makeText(this.state.monthPicker)}</b>.
            </p>
            secondChartType = (this.state.pomoChartData === null || this.state.pomoChartData.length === 0)? null :<DataCountSetter setCountType={this.changePomoCountType} optionType={2} countType={this.state.pomoCountType}/>
        }
        else if(this.state.chartType === 3){ //Year
            firstChartType = (this.state.elapseChartData === null || this.state.elapseChartData.length === 0)? null :<DataCountSetter setCountType={this.changeChartCountType} optionType={3} countType={this.state.chartCountType}/>
            timeButton = <div className="timeOut">
                <button className="timeButton" onClick={this.changeDays}>Day</button>
                <button className="timeButton" onClick={this.changeWeeks}>Week</button>
                <button className="timeButton" onClick={this.changeMonths}>Month</button>
                <button className="timeButtonPress">Year</button>
                <button className="timeButton" onClick={this.changeCustom}>Custom</button>
            </div>;
            dateInput = <div className="monthPickerYear">
                <button className="prevYear" onClick={this.lastYear}>&lt;</button>
                <input className="timeInput yearInput" value={this.state.yearInput} onChange={this.handleYearInput} />
                <button className="nextYear" onClick={this.nextYear}>&gt;</button>
            </div>
            firstChartDes = <p className="chartSup">
                {this.state.totalElapse} have been tracked in <b>{this.state.year}</b>.
            </p>
            secondChartDes = <p className="chartSup">
                You have done {this.state.totalPomo} Pomodoro Timers in <b>{this.state.year}</b>.
            </p>
            secondChartType = (this.state.pomoChartData === null || this.state.pomoChartData.length === 0)? null :<DataCountSetter setCountType={this.changePomoCountType} optionType={3} countType={this.state.pomoCountType}/>
        }
        else{ //Custom
            firstChartType = (this.state.elapseChartData === null || this.state.elapseChartData.length === 0)? null :<DataCountSetter setCountType={this.changeChartCountType} optionType={3} countType={this.state.chartCountType}/>
            timeButton = <div className="timeOut">
                <button className="timeButton" onClick={this.changeDays}>Day</button>
                <button className="timeButton" onClick={this.changeWeeks}>Week</button>
                <button className="timeButton" onClick={this.changeMonths}>Month</button>
                <button className="timeButton" onClick={this.changeYears}>Year</button>
                <button className="timeButtonPress">Custom</button>
            </div>;
            dateInput = <div className="customInputOuter">
                <input className="timeInput" placeholder={this.state.date.toLocaleDateString()} value={this.state.fromInput} 
                onChange={this.handlefromInput}
                />
                <span> - </span>
                <input className="timeInput" placeholder={this.state.date.toLocaleDateString()} value={this.state.toInput} 
                onChange={this.handletoInput}
            />
            </div>
            const { from, to } = this.state;
            datePicker = <div className="customPickerOuter"><DayPicker
                className="customPicker"
                numberOfMonths={1}
                selectedDays={[this.state.from, { from, to }]}
                modifiers={{ start: from, end: to }}
                onDayClick={this.handleCustomDayClick}
            /></div>
            firstChartDes = <p className="chartSup">
                {this.state.totalElapse} have been tracked between <b>{this.state.startDate.toLocaleDateString()} - { (new Date(this.state.endDate.getFullYear(), this.state.endDate.getMonth(), this.state.endDate.getDate() - 1)).toLocaleDateString()}</b>.
            </p>
            secondChartDes = <p className="chartSup">
                Between <b>{this.state.startDate.toLocaleDateString()} - { (new Date(this.state.endDate.getFullYear(), this.state.endDate.getMonth(), this.state.endDate.getDate() - 1)).toLocaleDateString()}</b>, you have done {this.state.totalPomo} Pomodoro Timers.
            </p>
            secondChartType = (this.state.pomoChartData === null || this.state.pomoChartData.length === 0)? null :<DataCountSetter setCountType={this.changePomoCountType} optionType={3} countType={this.state.pomoCountType}/>
        }
        return (
            <div>
                <MediaQuery query="(min-width: 800px)">
                    <div className="statMain">
                        <div className="timeSelect">
                            {timeButton}
                            <div className="dateInputOuter">
                                {dateInput}
                            </div>
                            <div className="datePickerOuter">
                                {datePicker}
                            </div>
                        </div>
                        <div className="chartOuter">
                            <div className="indieChart">
                                <h2 className="chartDescription">Recorder Events</h2>
                                {firstChartType}
                                {timerChart}
                                {firstChartDes}
                                {firstChartSupDes}
                            </div>
                            <div className="indieChart">
                                <h2 className="chartDescription">Eaten Pomodoros</h2>
                                {secondChartType}
                                {pomoChart}
                                {secondChartDes}
                            </div>
                        </div>
                    </div>
                </MediaQuery>
                <MediaQuery query="(max-width: 799px)">
                    <div className="statMainPro">
                        <div className="timeSelectPro">
                            {timeButton}
                            <div className="dateInputOuter">
                                {dateInput}
                            </div>
                            <div className="datePickerOuter">
                                {datePicker}
                            </div>
                        </div>
                        <div className="chartOuterPro">
                            <div className="indieChart">
                                <h2 className="chartDescription">Recorder Events</h2>
                                {firstChartType}
                                {timerChartPro}
                                {firstChartDes}
                                {firstChartSupDes}
                            </div>
                            <div className="indieChart">
                                <h2 className="chartDescription">Eaten Pomodoros</h2>
                                {secondChartType}
                                {pomoChartPro}
                                {secondChartDes}
                            </div>
                        </div>
                    </div>
                </MediaQuery>
            </div>
        )
    }
}
export default Chart;
