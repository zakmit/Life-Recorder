import React, { Component } from 'react'
import { Switch, Route, Redirect, NavLink } from 'react-router-dom'
import Time from '../components/Time'
import MediaQuery from 'react-responsive'
import 'react-table/react-table.css'
import ReactSVG from 'react-svg'
import Table from './Table'
import Chart from './Chart'
import Cards from './Cards'

const rightBorder = {
    borderRight: "1px solid rgb(194, 200, 202)"
}
class Statistics extends Component {
    render() {        
        
    return (
        <div>
            <Time className="Timer-header" hours={this.props.hours} minutes={this.props.minutes} seconds={this.props.seconds} showHours={this.props.showHours}/>
            <Switch>
                <Redirect from="/statistics/chart" to="/statistics" />
                <Route exact path="/statistics/table" render={(props) => <Table {...props} server={this.props.server} userId={this.props.userId}/> }></Route>
                <Route exact path="/statistics" render={(props) => <Chart {...props} server={this.props.server} userId={this.props.userId}/> }></Route>
                <Route exact path="/statistics/cards" render={(props) => <Cards {...props} server={this.props.server} userId={this.props.userId}
                imgSize={this.props.imgSize} themeImgs={this.props.themeImgs} radius={this.props.radius}/> }></Route>
            </Switch>
            <MediaQuery query="(min-width: 900px)">
                <span className="iconOut">
                    <NavLink to="/statistics/chart"><button style={rightBorder} className="iconButton"><ReactSVG beforeInjection={svg => {
                        svg.classList.add('icons')
                    }}
                    src="/icons/Chart.svg" className="icon-wrapper"/></button></NavLink>
                    <NavLink to="/statistics/table"><button style={rightBorder} className="iconButton"><ReactSVG beforeInjection={svg => {
                        svg.classList.add('icons')
                    }}
                    src="/icons/Table.svg" className="icon-wrapper"/></button></NavLink>
                    <NavLink to="/statistics/cards"><button className="iconButton"><ReactSVG beforeInjection={svg => {
                        svg.classList.add('icons')
                    }}
                    src="/icons/Cards.svg" className="icon-wrapper"/></button></NavLink>
                </span>
            </MediaQuery>
            <MediaQuery query="(max-width: 899px)">
                <span className="iconOutPro">
                    <NavLink to="/statistics/chart"><button style={rightBorder} className="iconButtonPro"><ReactSVG beforeInjection={svg => {
                        svg.classList.add('iconsPro')
                    }}
                    src="/icons/Chart.svg" className="icon-wrapper"/></button></NavLink>
                    <NavLink to="/statistics/table"><button style={rightBorder} className="iconButtonPro"><ReactSVG beforeInjection={svg => {
                        svg.classList.add('iconsPro')
                    }}
                    src="/icons/Table.svg" className="icon-wrapper"/></button></NavLink>
                    <NavLink to="/statistics/cards"><button className="iconButtonPro"><ReactSVG beforeInjection={svg => {
                        svg.classList.add('iconsPro')
                    }}
                    src="/icons/Cards.svg" className="icon-wrapper"/></button></NavLink>
                </span>
            </MediaQuery>

        </div>
    )
    }
}

export default Statistics;
