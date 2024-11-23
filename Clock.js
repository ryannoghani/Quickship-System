class Clock
{
    GetTime()
    {
        // Get time for specific locations
        const moment = require('moment');
        const options = {location: "America/Los_Angeles", hour: '2-digit', minute: '2-digit', hour12: false };  
        return moment().format('MMMM Do YYYY') + ": " + new Intl.DateTimeFormat('en-US', options).format(new Date()); //I got this function from ChatGPT
    }
}

module.exports = Clock; //Used so that other files can import the Clock class
