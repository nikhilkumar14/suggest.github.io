import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { TextInput, Button } from '@contentful/forma-36-react-components';
import { init } from 'contentful-ui-extensions-sdk';
import axios from 'axios';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-tokens/dist/css/index.css';
import './index.css';

const DANDELION_URL = "https://api.dandelion.eu/datatxt/cl/v1";
const DANDELION_MODEL_ID = "54cf2e1c-e48a-4c14-bb96-31dc11f84eac";

class App extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired,
  };

  detachExternalChangeHandlerMethods = [];

  constructor(props) {
    super(props);
    this.state = {
      value: props.sdk.field.getValue(),
      description: props.sdk.entry.fields.description.getValue(),
      loading: false,
    };
  }

  componentDidMount() {
    this.props.sdk.window.startAutoResizer();

    // Handler for external field value changes (e.g. when multiple authors are working on the same entry).
    this.detachExternalChangeHandlerMethods.push(
      this.props.sdk.field.onValueChanged(value => this.setState({ value }))
    );
    this.detachExternalChangeHandlerMethods.push(
      this.props.sdk.entry.fields.description.onValueChanged(
        description => this.setState({ description })
      )
    );
  }

  componentWillUnmount() {
    this.detachExternalChangeHandlerMethods.forEach(detach => detach())
  }

  handleClickSuggest = async () => {
    this.setState({ loading: true });

    try {
      const params = {
        token: this.props.sdk.parameters.installation.dandelionApiToken,
        model: DANDELION_MODEL_ID,
        text: this.state.description
      };
      const response = await axios.get(DANDELION_URL, { params });

      if (response.data.categories.length > 0) {
        const topCategory = response.data.categories[0].name;
        this.setState({ value: topCategory });
        this.props.sdk.field.setValue(topCategory);
      } else {
        this.setState({ value: '' });
        this.props.sdk.field.removeValue();
      }
    } catch (error) {
      console.log(error);
    }

    this.setState({ loading: false });
  };

  render() {
    return (
      <>
        <TextInput
          width="full"
          type="text"
          value={this.state.value}
          disabled={true}
          className="SuggestCategory__TextInput"
        />
        <Button loading={this.state.loading} onClick={this.handleClickSuggest}>
          Suggest
        </Button>
      </>
    );
  }
}

init(sdk => {
  ReactDOM.render(<App sdk={sdk} />, document.getElementById('root'));
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
