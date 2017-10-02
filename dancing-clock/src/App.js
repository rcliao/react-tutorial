import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './App.css';
import Clock from './Clock';
import Rythm from 'rythm.js'

const rythm = new Rythm();
const DAY = 86400000;
const HOUR = 3600000;
const MINUTE = 60000;

// TODO: parse the due date from the control panel
const due = new Date();
due.setHours(21);
due.setMinutes(30);
due.setSeconds(59);

class ReminderStorage {
  constructor(storage, name) {
    this.storage = storage;
    this.name = name;
  }

  setReminderDone(reminder) {
    this.storage.setItem(this._getKey(reminder), 'true');
  }

  isReminderAnnounced(reminder) {
    const reminderValue = this.storage.getItem(this._getKey(reminder));
    return reminderValue && reminderValue === 'true';
  }

  _getKey(reminder) {
    return this.name + '-' + reminder;
  }
}

function getMinuteDifference(date1, date2) {
  const diffMs = date1 - date2;
  return Math.floor((diffMs % DAY) / HOUR) * 60 + Math.floor(((diffMs % DAY) % HOUR) / MINUTE);
}

class ClockApp extends Component {
  constructor(props) {
    const now = new Date();
    super(props);
    this.state = {
      dancing: false,
      date: now,
      minuteDiff: getMinuteDifference(props.due, now),
      title: props.title,
      due: props.due
    };
    this.reminderStorage = new ReminderStorage(window.sessionStorage, props.title);

    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleDueChange = this.handleDueChange.bind(this);
  }

  toggleDance(toggle) {
    const newState = toggle === undefined ? !this.state.dancing : toggle;
    if (!newState) {
      rythm.stop();
    } else {
      rythm.addRythm('vanish', 'vanish', 0, 10);
      rythm.setMusic('/rythmC.mp3');
      rythm.start();
    }
    this.setState({dancing: newState});
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    const now = new Date()
    const minuteDiff = getMinuteDifference(this.state.due, now);
    this.setState({
      date: now,
      minuteDiff
    });
    if (this.props.reminders.includes(minuteDiff) && !this.reminderStorage.isReminderAnnounced(minuteDiff)) {
      this.speak('You have ' + minuteDiff + ' minutes left until the ' + this.state.title + ' is due.', () => {
        this.speak('Again. You have ' + minuteDiff + ' minutes left until the ' + this.state.title + ' is due.', () => {
          if (minuteDiff === this.props.reminders[0]) {
            if (!this.state.dancing) {
              this.toggleDance(true);
            }
          }
        });
      });
      this.reminderStorage.setReminderDone(minuteDiff);
    }
  }

  speak(message, cb) {
    const msg = new window.SpeechSynthesisUtterance();
    const voices = window.speechSynthesis.getVoices();
    msg.voice = voices[10]; // Note: some voices don't support altering params
    msg.voiceURI = 'native';
    msg.volume = 1; // 0 to 1
    msg.text = message;
    msg.lang = 'en-US';

    msg.onend = function(e) {
      cb();
    };

    window.speechSynthesis.speak(msg);
  }

  getFormattedDifferenceInMinutes() {
    const {minuteDiff} = this.state;
    return minuteDiff > 0 ? 'in ' + minuteDiff + ' minutes' : 'Beep beep!';
  }

  getDueInHoursMinutes() {
    return this.state.due.getHours() + ':' + this.state.due.getMinutes();
  }

  handleTitleChange(event) {
    this.setState({title: event.target.value});
  }

  handleDueChange(event) {
    // TODO: parse the string format of time to time value
  }

  getWarningClass() {
    const {minuteDiff} = this.state;
    for (var i = this.props.reminders.length - 1; i >= 0; i --) {
      if (minuteDiff <= this.props.reminders[i]) {
        return this.props.reminderClasses[i];
      }
    }
  }

  render() {
    return (
      <div className="app">
        <h1>{this.state.title}</h1>
        <div className='rythm-bass rythm vanish'>
          <Clock
            onClick={() => this.toggleDance()}
            date={this.state.date}
          >
          </Clock>
        </div>
        <p className="hint">
          Due: {this.state.due.toLocaleTimeString()} -
          <span className={this.getWarningClass()}> {this.getFormattedDifferenceInMinutes()}</span>
        </p>
        <div className="hidden control-form">
          <label htmlFor="title">Title: </label>
          <input id="title" type="text" value={this.state.title} onChange={this.handleTitleChange}/>

          <label htmlFor="due">Due: </label>
          <input id="due" type="text" value={this.getDueInHoursMinutes()} onChange={this.handleDueChange} />
        </div>
      </div>
    );
  }
}

ClockApp.propTypes = {
  title: PropTypes.string,
  reminders: PropTypes.array,
  reminderClasses: PropTypes.array,
  due: PropTypes.instanceOf(Date)
};

ClockApp.defaultProps = {
  title: 'Lab 2',
  due,
  reminders: [30, 15, 5],
  reminderClasses: ['warn', 'second-warn', 'error']
};

export default ClockApp;
