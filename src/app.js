const noble = require('noble');

const EXPECTED_MANUFACTURER_DATA_LENGTH = 25;
const APPLE_COMPANY_IDENTIFIER = 0x004c;
const IBEACON_TYPE = 0x02;
const EXPECTED_IBEACON_DATA_LENGTH = 0x15;

if (noble.state === 'poweredOn') {
  noble.startScanning([], true);
} else {
  noble.on('stateChange', function() {
    noble.startScanning([], true);
  });
}

let discovered = {};
noble.on('discover', function(peripheral) {
    var manufacturerData = peripheral.advertisement.manufacturerData;
    var rssi = peripheral.rssi;
    if (manufacturerData &&
        EXPECTED_MANUFACTURER_DATA_LENGTH <= manufacturerData.length &&
        APPLE_COMPANY_IDENTIFIER === manufacturerData.readUInt16LE(0) &&
        IBEACON_TYPE === manufacturerData.readUInt8(2) &&
        EXPECTED_IBEACON_DATA_LENGTH === manufacturerData.readUInt8(3)) {

      var uuid = manufacturerData.slice(4, 20).toString('hex');
      var major = manufacturerData.readUInt16BE(20);
      var minor = manufacturerData.readUInt16BE(22);
      var measuredPower = manufacturerData.readInt8(24);
      var accuracy = Math.pow(12.0, 1.5 * ((rssi / measuredPower) - 1));

      let bleacon = {};
      bleacon.key = uuid.concat(major, minor);
      bleacon.uuid = uuid;
      bleacon.major = major;
      bleacon.minor = minor;
      bleacon.measuredPower = measuredPower;
      bleacon.rssi = rssi;
      bleacon.accuracy = accuracy;
      bleacon.date = Date.now();

      store.dispatch({ type: 'DISCOVER', data: bleacon });

      // console.log('%d : onDiscover: uuid = %s, major = %d, minor = %d, measuredPower = %d, accuracy = %f', bleacon.date, uuid, major, minor, measuredPower, accuracy);
    }

});


import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'

import injectTapEventPlugin from 'react-tap-event-plugin';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import {List, ListItem} from 'material-ui/List';
import ContentInbox from 'material-ui/svg-icons/content/inbox';
import _ from 'lodash';

injectTapEventPlugin();

const reducer = (state = {}, action) => {
  switch(action.type) {
    case 'DISCOVER':
      let data = {};
      data[action.data.uuid] = action.data;
      return Object.assign({}, state, data);
    case 'REFRESH':
      let list =  _.filter(_.toArray(state), (beacon) => {
          console.log(Date.now() - beacon.date)
          return (Date.now() - beacon.date) >= 5000;
        });
      return list;
    default:
      return state;
  }
}
const store = createStore(reducer);

const refresh = () => {
  store.dispatch({ type: 'REFRESH', date: Date.now() })
}


var BeaconList = React.createClass({
  componentDidMount: function() {
    setInterval(
      "refresh()",
      5000
    );
  },
  render: function() {
    // console.log(JSON.stringify(store.getState()));
    var listItems = _.toArray(store.getState()).map(function(beacon) {
      return (
        <ListItem key={beacon.key} primaryText={beacon.key} leftIcon={<ContentInbox />} />
      );
    });

    return (
      <MuiThemeProvider className="BeaconList" muiTheme={getMuiTheme(baseTheme)}>
        <List className="Beacons">
          {listItems}
        </List>
      </MuiThemeProvider>
    );
  }
});

const render = () => {
  ReactDOM.render(
    <BeaconList data={discovered}/>,
    document.getElementById('content')
  );
};

store.subscribe(render);
render();
