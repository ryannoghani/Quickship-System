const Clock = require('./Clock');   //We're including the container class

class LogFileUpdater
{
    constructor() 
    {
        this.clock = new Clock();
        this.logFileName = "KeoghPort" + this.clock.GetTime().substring(14,this.clock.GetTime().length - 7) + ".txt"
    }

    LogIn(username)
    {
        var fs = require("fs");
        fs.appendFileSync("KeoghPort2024.txt", this.clock.GetTime() + " " + username + " signs in\n");
    }

    LogOut(username)
    {
        var fs = require("fs");
        fs.appendFileSync("KeoghPort2024.txt", this.clock.GetTime() + " " + username + " signs out\n");
    }

    OpenManifest(manifestFileName, numContainersOnShip)
    {
        var fs = require("fs");
        fs.appendFileSync("KeoghPort2024.txt", this.clock.GetTime() + " Manifest " + manifestFileName + " is opened, there are " + numContainersOnShip + " containers on the ship\n");
    }

    FinishCycle(manifestFileName)
    {
        var fs = require("fs");
        fs.appendFileSync("KeoghPort2024.txt", this.clock.GetTime() + " Finished a Cycle. Manifest " + manifestFileName + " was written to desktop, and a reminder pop-up to operator to send file was displayed.\n");
    }

    OnLoad(manifestFileName)
    {
        var fs = require("fs");
        fs.appendFileSync("KeoghPort2024.txt", this.clock.GetTime() + " " + manifestFileName + " is onloaded.\n");
    }

    OffLoad(manifestFileName)
    {
        var fs = require("fs");
        fs.appendFileSync("KeoghPort2024.txt", this.clock.GetTime() + " " + manifestFileName + " is offloaded.\n");
    }

    Comment(string_of_comment)
    {
        var fs = require("fs");
        fs.appendFileSync("KeoghPort2024.txt", this.clock.GetTime() + " " + string_of_comment + '\n');
    }

    UpdateLogFileName() //This function updates the log text file's name with the correct year
    {
        var fs = require("fs");
        fs.renameSync(this.logFileName, "KeoghPort" + this.clock.GetTime().substring(14,this.clock.GetTime().length - 7) + ".txt");
        this.logFileName = this.clock.GetTime().substring(14,this.clock.GetTime().length - 7) + ".txt";
    }
}
