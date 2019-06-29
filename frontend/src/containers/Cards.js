import React, { Component } from 'react'
import queryString from 'query-string'
import InfiniteScroll from 'react-infinite-scroller';
import './Cards.scss'
import sketch from '../components/Sketch';
import P5Wrapper from 'react-p5-wrapper';
import { timeToString } from '../script/timeToString';

function sortByTime(a, b) {
    let aDate = new Date(a.startTime);
    let bDate = new Date(b.startTime);
    if(aDate < bDate){
        return 1;
    }
    if(aDate > bDate) {
        return -1;
    }
    return 0;
}

class Cards extends Component {
    constructor(props) {
        super(props);
        this.state = { tablepart: "", lastTime: new Date(), cards: [], hasMore: true
        }
        this.loadCards = this.loadCards.bind(this);
    }
    loadCards(page) {
        let rawdata;        
        fetch(this.props.server+ "cards?" + queryString.stringify({
            userId: this.props.userId,
            lastTime: this.state.lastTime
        }), {
            method: 'GET',
        })
        .then(res => res.json())
        .then(data => rawdata = data)
        .then(() => {
            console.log(rawdata);
            
            let cards = this.state.cards;
            if(rawdata.length > 0) {
                rawdata.sort(sortByTime);
                for(let i = 0; i < rawdata.length; i++) {
                    cards.push(rawdata[i]);
                }
                this.setState({cards: cards, lastTime: new Date(rawdata[rawdata.length-1].startTime)});
            }
            else
                this.setState({hasMore: false});
        })
    }
    render() {
        let items = [];
        console.log(this.props);
        
        this.state.cards.map((card, i) => {
            let background;
            if(card.pattern !== null) {
                background = <P5Wrapper sketch={sketch} width={300} height={100} pattern={card.pattern} 
                imgSize={this.props.imgSize/5} imgs={this.props.themeImgs} radius={this.props.radius/5}/>
            }
            items.push(
                <div className="cardContainer" key={i}>
                    <div className="card">
                        <div className="left">
                            <div>From:</div>
                            <div>{(new Date(card.startTime)).toLocaleDateString()} {(new Date(card.startTime)).toLocaleTimeString()}</div>
                        </div>
                        <div className="middle">
                            <div className="cardTitle">{card.title}</div>
                            <div className="cardTime">{timeToString(card.elapse)}</div>
                        </div>
                        <div className="right">
                            <div>To:</div>
                            <div>{(new Date(card.endTime)).toLocaleDateString()} {(new Date(card.endTime)).toLocaleTimeString()}</div>
                        </div>
                    </div>
                    <div className="cardBackground">
                        {background}
                    </div>
                </div>
            );
            return null;
        });

        return (
            <div className="cardsOuter">
                <InfiniteScroll
                    pageStart={0}
                    loadMore={this.loadCards}
                    hasMore={this.state.hasMore}
                    loader={<div className="loader" key={0}>Loading ...</div>}
                    useWindow={false}
                >
                    {items}
                </InfiniteScroll>
            </div>
        )
    }
}
export default Cards;
