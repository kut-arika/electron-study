'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _redux = require('redux');

var _reactTapEventPlugin = require('react-tap-event-plugin');

var _reactTapEventPlugin2 = _interopRequireDefault(_reactTapEventPlugin);

var _MuiThemeProvider = require('material-ui/styles/MuiThemeProvider');

var _MuiThemeProvider2 = _interopRequireDefault(_MuiThemeProvider);

var _lightBaseTheme = require('material-ui/styles/baseThemes/lightBaseTheme');

var _lightBaseTheme2 = _interopRequireDefault(_lightBaseTheme);

var _getMuiTheme = require('material-ui/styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

var _List = require('material-ui/List');

var _inbox = require('material-ui/svg-icons/content/inbox');

var _inbox2 = _interopRequireDefault(_inbox);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var noble = require('noble');

var EXPECTED_MANUFACTURER_DATA_LENGTH = 25;
var APPLE_COMPANY_IDENTIFIER = 0x004c;
var IBEACON_TYPE = 0x02;
var EXPECTED_IBEACON_DATA_LENGTH = 0x15;

if (noble.state === 'poweredOn') {
  noble.startScanning([], true);
} else {
  noble.on('stateChange', function () {
    noble.startScanning([], true);
  });
}

var discovered = {};
noble.on('discover', function (peripheral) {
  var manufacturerData = peripheral.advertisement.manufacturerData;
  var rssi = peripheral.rssi;
  if (manufacturerData && EXPECTED_MANUFACTURER_DATA_LENGTH <= manufacturerData.length && APPLE_COMPANY_IDENTIFIER === manufacturerData.readUInt16LE(0) && IBEACON_TYPE === manufacturerData.readUInt8(2) && EXPECTED_IBEACON_DATA_LENGTH === manufacturerData.readUInt8(3)) {

    var uuid = manufacturerData.slice(4, 20).toString('hex');
    var major = manufacturerData.readUInt16BE(20);
    var minor = manufacturerData.readUInt16BE(22);
    var measuredPower = manufacturerData.readInt8(24);
    var accuracy = Math.pow(12.0, 1.5 * (rssi / measuredPower - 1));

    var bleacon = {};
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

(0, _reactTapEventPlugin2.default)();

var reducer = function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  switch (action.type) {
    case 'DISCOVER':
      var data = {};
      data[action.data.uuid] = action.data;
      return Object.assign({}, state, data);
    case 'REFRESH':
      var list = _lodash2.default.filter(_lodash2.default.toArray(state), function (beacon) {
        console.log(Date.now() - beacon.date);
        return Date.now() - beacon.date >= 5000;
      });
      return list;
    default:
      return state;
  }
};
var store = (0, _redux.createStore)(reducer);

var refresh = function refresh() {
  store.dispatch({ type: 'REFRESH', date: Date.now() });
};

var BeaconList = _react2.default.createClass({
  displayName: 'BeaconList',

  componentDidMount: function componentDidMount() {
    setInterval("refresh()", 5000);
  },
  render: function render() {
    // console.log(JSON.stringify(store.getState()));
    var listItems = _lodash2.default.toArray(store.getState()).map(function (beacon) {
      return _react2.default.createElement(_List.ListItem, { key: beacon.key, primaryText: beacon.key, leftIcon: _react2.default.createElement(_inbox2.default, null) });
    });

    return _react2.default.createElement(
      _MuiThemeProvider2.default,
      { className: 'BeaconList', muiTheme: (0, _getMuiTheme2.default)(_lightBaseTheme2.default) },
      _react2.default.createElement(
        _List.List,
        { className: 'Beacons' },
        listItems
      )
    );
  }
});

var render = function render() {
  _reactDom2.default.render(_react2.default.createElement(BeaconList, { data: discovered }), document.getElementById('content'));
};

store.subscribe(render);
render();