import noble from 'noble';

const EXPECTED_MANUFACTURER_DATA_LENGTH = 25;
const APPLE_COMPANY_IDENTIFIER = 0x004c;
const IBEACON_TYPE = 0x02;
const EXPECTED_IBEACON_DATA_LENGTH = 0x15;

export default class IBeaconService {
  constructor(store) {
    this.store = store;
  }

  startScanning() {
    if (noble.state === 'poweredOn') {
      this.discover();
    } else {
      noble.on('stateChange', () => {
        this.discover();
      });
    }
  }

  discover() {
    noble.startScanning([], true);
    noble.on('discover', (peripheral) => {
      const manufacturerData = peripheral.advertisement.manufacturerData;
      const rssi = peripheral.rssi;
      if (manufacturerData &&
        EXPECTED_MANUFACTURER_DATA_LENGTH <= manufacturerData.length &&
        APPLE_COMPANY_IDENTIFIER === manufacturerData.readUInt16LE(0) &&
        IBEACON_TYPE === manufacturerData.readUInt8(2) &&
        EXPECTED_IBEACON_DATA_LENGTH === manufacturerData.readUInt8(3)) {
        const uuid = manufacturerData.slice(4, 20).toString('hex');
        const major = manufacturerData.readUInt16BE(20);
        const minor = manufacturerData.readUInt16BE(22);
        const measuredPower = manufacturerData.readInt8(24);
        const accuracy = Math.pow(12.0, 1.5 * ((rssi / measuredPower) - 1));

        const beacon = {
          key: uuid.concat(major, minor),
          uuid,
          major,
          minor,
          measuredPower,
          rssi,
          accuracy,
          date: Date.now(),
        };

        this.store.dispatch({ type: 'DISCOVER', data: beacon });
      }
    });
  }
}
