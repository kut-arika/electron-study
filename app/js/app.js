const noble = require('noble');

const EXPECTED_MANUFACTURER_DATA_LENGTH = 25;
const APPLE_COMPANY_IDENTIFIER = 0x004c;
const IBEACON_TYPE = 0x02;
const EXPECTED_IBEACON_DATA_LENGTH = 0x15;

if (noble.state === 'poweredOn') {
  noble.startScanning([], true);
} else {
  noble.on('stateChange', function () {
    noble.startScanning([], true);
  });
}
let discovered = {};
noble.on('discover', function (peripheral) {
  var manufacturerData = peripheral.advertisement.manufacturerData;
  var rssi = peripheral.rssi;
  if (manufacturerData && EXPECTED_MANUFACTURER_DATA_LENGTH <= manufacturerData.length && APPLE_COMPANY_IDENTIFIER === manufacturerData.readUInt16LE(0) && IBEACON_TYPE === manufacturerData.readUInt8(2) && EXPECTED_IBEACON_DATA_LENGTH === manufacturerData.readUInt8(3)) {

    var uuid = manufacturerData.slice(4, 20).toString('hex');
    var major = manufacturerData.readUInt16BE(20);
    var minor = manufacturerData.readUInt16BE(22);
    var measuredPower = manufacturerData.readInt8(24);
    var accuracy = Math.pow(12.0, 1.5 * (rssi / measuredPower - 1));

    let bleacon = {};
    bleacon.uuid = uuid;
    bleacon.major = major;
    bleacon.minor = minor;
    bleacon.measuredPower = measuredPower;
    bleacon.rssi = rssi;
    bleacon.accuracy = accuracy;

    discovered[peripheral.uuid] = bleacon;

    console.log('onDiscover: uuid = %s, major = %d, minor = %d, measuredPower = %d, accuracy = %f', uuid, major, minor, measuredPower, accuracy);
  }
});