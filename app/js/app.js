'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var _IBeaconService = require('../js/IBeaconService');

var _IBeaconService2 = _interopRequireDefault(_IBeaconService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(0, _reactTapEventPlugin2.default)();

var reducer = function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  switch (action.type) {
    case 'DISCOVER':
      {
        var data = _defineProperty({}, action.data.uuid, action.data);
        return Object.assign({}, state, data);
      }
    case 'REFRESH':
      {
        return _lodash2.default.filter(_lodash2.default.toArray(state), function (beacon) {
          return Date.now() - beacon.date > 5000;
        });
      }
    default:
      return state;
  }
};

var store = (0, _redux.createStore)(reducer);

var beaconService = new _IBeaconService2.default(store);
beaconService.startScanning();

var BeaconList = function (_React$Component) {
  _inherits(BeaconList, _React$Component);

  function BeaconList() {
    _classCallCheck(this, BeaconList);

    return _possibleConstructorReturn(this, (BeaconList.__proto__ || Object.getPrototypeOf(BeaconList)).apply(this, arguments));
  }

  _createClass(BeaconList, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      setInterval(function () {
        return store.dispatch({ type: 'REFRESH', date: Date.now() });
      }, 5000);
    }
  }, {
    key: 'render',
    value: function render() {
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
  }]);

  return BeaconList;
}(_react2.default.Component);

var render = function render() {
  _reactDom2.default.render(_react2.default.createElement(BeaconList, null), document.getElementById('content'));
};

store.subscribe(render);
render();