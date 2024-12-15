import moment from "moment";

export default class Clock {
  GetTime() {
    // Get time for specific locations
    const options = {
      location: "America/Los_Angeles",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return (
      moment().format("MMMM Do YYYY") +
      ": " +
      new Intl.DateTimeFormat("en-US", options).format(new Date())
    );
  }

  GetTimeLogFormat() {
    // Get time for specific locations
    const options = {
      location: "America/Los_Angeles",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return (
      moment().format("YYYY-MM-DD") +
      " " +
      new Intl.DateTimeFormat("en-US", options).format(new Date())
    );
  }

  GetYear() {
    return moment().year();
  }
}
