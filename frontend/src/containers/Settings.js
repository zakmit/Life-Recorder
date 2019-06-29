import React, { Component } from 'react';
import Switch from "react-switch";
import Time from '../components/Time'
import MediaQuery from 'react-responsive';

class Settings extends Component {
    render() {
        return (
            <div>
                <Time className="Timer-header" hours={this.props.hours} minutes={this.props.minutes} seconds={this.props.seconds} showHours={this.props.showHours}/>
                <MediaQuery query="(min-width: 900px)">
                    <div className="SettingContainer">
                        <div className="form-group">
                            <select value={this.props.themeName} onChange={this.props.changeTheme} className="themeSelect" >
                                <option value="Seashore[Blue]">Seashore[Blue]</option>
                                <option value="Seashore">Seashore</option>
                            </select>
                            <div className="settingDes">Select Theme (will be used in next Timer, or resize to update the background)</div>
                        </div>
                        {/* <div>
                            <label>
                                <span></span>
                                <Switch className="settingSlider" onChange={this.props.changeFont} activeBoxShadow='0 0 2px 3px #c0c3c4' checked={this.props.fontBool} offColor="#c2c8ca" onColor="#626b6e" uncheckedIcon={false} checkedIcon={false} width={100} height={40} handleDiameter={35}/>
                            </label>
                            <div className="settingDes">
                                Use Alternative Font
                            </div>
                        </div> */}
                        <div>
                            <label>
                                <span></span>
                                <Switch className="settingSlider" onChange={this.props.changeHours} activeBoxShadow='0 0 2px 3px #c0c3c4' checked={this.props.showHours} offColor="#c2c8ca" onColor="#626b6e" uncheckedIcon={false} checkedIcon={false} width={100} height={40} handleDiameter={35}/>
                            </label>
                            <div className="settingDes">
                                Show hours or not?
                            </div>
                        </div>
                        <div>
                            <input className="PomoInput" placeholder="How long for a Pomodoro?" value={this.props.pomoMinutes} 
                        onChange={this.props.changePomo}/>
                            <div className="GapforPomo"/>
                            <div className="settingDes">
                                How long for a Pomodoro?(Can't be modified while Pomodoro timer running)
                            </div>
                        </div>
                    </div>
                </MediaQuery>
                <MediaQuery query="(max-width: 900px)">
                    <div className="Protrait_SettingContainer">
                        <div className="form-group">
                            <select value={this.props.themeName} onChange={this.props.changeTheme} className="themeSelect" >
                                <option value="Seashore[Blue]">Seashore[Blue]</option>
                                <option value="Seashore">Seashore</option>
                            </select>
                            <div className="settingDes">Select Theme</div>
                        </div>
                        {/* <div>
                            <label>
                                <span></span>
                                <Switch className="settingSlider" onChange={this.props.changeFont} activeBoxShadow='0 0 2px 3px #c0c3c4' checked={this.props.fontBool} offColor="#c2c8ca" onColor="#626b6e" uncheckedIcon={false} checkedIcon={false} width={100} height={40} handleDiameter={35}/>
                            </label>
                            <div className="settingDes">
                                Use Alternative Font
                            </div>
                        </div> */}
                        <div>
                            <label>
                                <span></span>
                                <Switch className="settingSlider" onChange={this.props.changeHours} activeBoxShadow='0 0 2px 3px #c0c3c4' checked={this.props.showHours} offColor="#c2c8ca" onColor="#626b6e" uncheckedIcon={false} checkedIcon={false} width={100} height={40} handleDiameter={35}/>
                            </label>
                            <div className="settingDes">
                                Show hours or not?
                            </div>
                        </div>
                        <div>
                            <input className="PomoInput" placeholder="How long for a Pomodoro?" value={this.props.pomoMinutes} 
                        onChange={this.props.changePomo}/>
                            <div className="GapforPomo"/>
                            <div className="settingDes">
                                How long for a Pomodoro?
                            </div>
                            {/* (Can't be modified while Pomodoro) */}
                        </div>
                    </div>
                </MediaQuery>
            </div>
        )
    }
}

export default Settings;
