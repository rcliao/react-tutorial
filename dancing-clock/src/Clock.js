import React, { Component } from 'react';

class Clock extends Component {
  getHour() {
    return pad(this.props.date.getHours() % 12, 2);
  }

  getSecond() {
    return pad(this.props.date.getSeconds(), 2);
  }

  getMinute() {
    return pad(this.props.date.getMinutes(), 2);
  }

  getAMPM() {
    return this.props.date.getHours() >= 12 ? 'PM' : 'AM';
  }

  render() {
    return (
      <div className="clock" onClick={() => this.props.onClick()}>
        <span className="hour">{this.getHour()}</span>
        <span className="separator">:</span>
        <span className="minute">{this.getMinute()}</span>
        <div className="meta">
          <span className="ampm">{this.getAMPM()}</span>
          <span className="second">{this.getSecond()}</span>
        </div>
      </div>
    );
  }
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

export default Clock;
