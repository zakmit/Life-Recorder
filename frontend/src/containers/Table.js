import React, { Component } from 'react'
import queryString from 'query-string'
import ReactTable from 'react-table'
import {timeToString} from '../script/timeToString'

let tabledata;
function appendLeadingZeroes(n){
    if(n <= 9){
      return "0" + n;
    }
    return n
}

class Table extends Component {
    constructor(props) {
        super(props);
        this.state = { tablepart: "",
        }
        fetch(this.props.server+ "alltask?" + queryString.stringify({
            userId: this.props.userId,
        }), {
            method: 'GET',
        })
        .then(res => res.json())
        .then(data => tabledata = data)
        .then(() => {
            console.log(tabledata);
            
            tabledata.forEach(function(element) {
            //Start Time
            let tmpDate = (new Date(element.startTime))
            element.startTime = tmpDate.getFullYear() + "/" + (tmpDate.getMonth() + 1) + "/" + tmpDate.getDate() + " " + appendLeadingZeroes(tmpDate.getHours()) + ":" + appendLeadingZeroes(tmpDate.getMinutes()) + ":" + appendLeadingZeroes(tmpDate.getSeconds());
            tmpDate = (new Date(element.endTime))
            element.endTime = tmpDate.getFullYear() + "/" + (tmpDate.getMonth() + 1) + "/" + tmpDate.getDate() + " " + appendLeadingZeroes(tmpDate.getHours()) + ":" + appendLeadingZeroes(tmpDate.getMinutes()) + ":" + appendLeadingZeroes(tmpDate.getSeconds());
            //Elapse
            element.elapse = timeToString(element.elapse)
            //isPomodoro
            if(element.isPomodoro) {
                element.isPomodoro = "✓";
            }
            else element.isPomodoro = "";
          });})//modified data
        .then(() => this.setState({tablepart: <ReactTable className="statTable -highlight" data={tabledata} defaultPageSize={20} columns={[
            {
                Header: "Working On",
                accessor: "title"
            },
            {
                Header: "Start from",
                accessor: "startTime"
            },
            {
                Header: "To",
                accessor: "endTime"
            },
            {
                Header: "For",
                accessor: "elapse"
            },
            {
                Header: "Pomodoro?",
                accessor: "isPomodoro"
            }
        ]} />}))
    }
    render() {
        return (
            <div>
                {this.state.tablepart}
            </div>
        )
    }
}
export default Table;
