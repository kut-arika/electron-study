import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { List, ListItem } from 'material-ui/List';
import ContentInbox from 'material-ui/svg-icons/content/inbox';
import _ from 'lodash';

import IBeaconService from '../js/IBeaconService';

injectTapEventPlugin();

const reducer = (state = {}, action) => {
  switch (action.type) {
    case 'DISCOVER': {
      const data = {
        [action.data.uuid]: action.data,
      };
      return Object.assign({}, state, data);
    }
    case 'REFRESH': {
      return _.filter(_.toArray(state), beacon => (Date.now() - beacon.date) > 5000);
    }
    default:
      return state;
  }
};

const store = createStore(reducer);

const beaconService = new IBeaconService(store);
beaconService.startScanning();


class BeaconList extends React.Component {
  componentDidMount() {
    setInterval(() => store.dispatch({ type: 'REFRESH', date: Date.now() }), 5000);
  }

  render() {
    const listItems = _.toArray(store.getState()).map(beacon =>
      <ListItem key={beacon.key} primaryText={beacon.key} leftIcon={<ContentInbox />} />
    );

    return (
      <MuiThemeProvider className="BeaconList" muiTheme={getMuiTheme(baseTheme)}>
        <List className="Beacons">
          {listItems}
        </List>
      </MuiThemeProvider>
    );
  }
}

const render = () => {
  ReactDOM.render(
    <BeaconList />,
    document.getElementById('content')
  );
};

store.subscribe(render);
render();
