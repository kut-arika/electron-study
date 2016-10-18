'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _noble = require('noble');

var _noble2 = _interopRequireDefault(_noble);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EXPECTED_MANUFACTURER_DATA_LENGTH = 25;
var APPLE_COMPANY_IDENTIFIER = 0x004c;
var IBEACON_TYPE = 0x02;
var EXPECTED_IBEACON_DATA_LENGTH = 0x15;

var IBeaconService = function () {
  function IBeaconService(store) {
    _classCallCheck(this, IBeaconService);

    this.store = store;
  }

  _createClass(IBeaconService, [{
    key: 'startScanning',
    value: function startScanning() {
      var _this = this;

      if (_noble2.default.state === 'poweredOn') {
        this.discover();
      } else {
        _noble2.default.on('stateChange', function () {
          _this.discover();
        });
      }
    }
  }, {
    key: 'discover',
    value: function discover() {
      var _this2 = this;

      _noble2.default.startScanning([], true);
      _noble2.default.on('discover', function (peripheral) {
        var manufacturerData = peripheral.advertisement.manufacturerData;
        var rssi = peripheral.rssi;
        if (manufacturerData && EXPECTED_MANUFACTURER_DATA_LENGTH <= manufacturerData.length && APPLE_COMPANY_IDENTIFIER === manufacturerData.readUInt16LE(0) && IBEACON_TYPE === manufacturerData.readUInt8(2) && EXPECTED_IBEACON_DATA_LENGTH === manufacturerData.readUInt8(3)) {
          var uuid = manufacturerData.slice(4, 20).toString('hex');
          var major = manufacturerData.readUInt16BE(20);
          var minor = manufacturerData.readUInt16BE(22);
          var measuredPower = manufacturerData.readInt8(24);
          var accuracy = Math.pow(12.0, 1.5 * (rssi / measuredPower - 1));

          var beacon = {
            key: uuid.concat(major, minor),
            uuid: uuid,
            major: major,
            minor: minor,
            measuredPower: measuredPower,
            rssi: rssi,
            accuracy: accuracy,
            date: Date.now()
          };

          _this2.store.dispatch({ type: 'DISCOVER', data: beacon });
        }
      });
    }
  }]);

  return IBeaconService;
}();

exports.default = IBeaconService;