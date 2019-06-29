function timeToString(elapse) {
    let secs = elapse;
    let minutes = Math.floor(secs/60);
    let hours = Math.floor(minutes/60);
    secs = secs%60;
    minutes = minutes % 60;
    if(hours === 0 && minutes === 0 && secs === 0) {
        return "Nothing"
    }
    if(hours > 0) {
        if(hours === 1) {
            hours = hours + " hr ";
        }
        else {
            hours = hours + " hrs ";
        }
    }
    else hours = "";
    if(minutes > 0) {
        if(minutes === 1) {
            minutes = minutes + " min ";
        }
        else {
            minutes = minutes + " mins ";
        }
    }
    else minutes = "";
    if(secs > 0) {
        if(secs === 1) {
            secs = secs + " sec";
        }
        else {
            secs = secs + " secs";
        }
    }
    else secs = "";
    return hours + minutes + secs;
}
export {timeToString};