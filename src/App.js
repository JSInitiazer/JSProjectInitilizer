import React, { Component } from 'react';
// import Container from './components/container/container';
import TopNavigation from './components/layouts/TopNavigation';
import BottomNavigation from './components/layouts/BottomNavigation';
import MainContainer from './components/layouts/MainContainer';
import './App.css';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { isUserWhitespacable } from '@babel/types';
import { connect } from 'react-redux';
import { fetchUIRenderData, submitInputData } from './redux/actions';
import * as constants from './assets/constants';


const theme = createMuiTheme({
  palette: {
    background: 'white',
  },
});

class App extends Component {

  constructor(props) {
    super(props);
    this.submitActionHandler = this.submitActionHandler.bind(this);
  }

  prepareRequestJson = () => {
    const tabs = this.props.response.tabs.map(tabItem => {
      return tabItem.childTab && tabItem.childTab.whichTab === tabItem.selectedValue ? {
        label: tabItem.label,
        value: tabItem.selectedValue,
        childTab: {
          label: tabItem.childTab.label,
          value: tabItem.childTab.selectedValue
        },
      } : {
          label: tabItem.label,
          value: tabItem.selectedValue,
        };
    });

    const metaData = this.props.response.metaData.map(inputItem => {
          return {
            label:inputItem.label,
            value:inputItem.value
          };
    }).filter(item =>{
      return item.value !== '';
    })

    const filteredDependencyList = []

    for (const category in this.props.response.dependencyList){
      filteredDependencyList.push(this.props.response.dependencyList[category].filter(dependency => {
          return dependency.value;
        }).map(dependency => {
          return  {
            label:dependency.label,
            value:true,
            version:dependency.version
          }
        }));
    }

    const requestParams = {
      tabItems:tabs,
      metaDataItems:metaData,
      dependenciesItem:[].concat.apply([],filteredDependencyList)
    }

    return requestParams;

  }

  validateInputs = (inputs) => {
    //validate project meta data
    const haveValidatedInputs = inputs.metaData.find(input => {
      return input.required == true && input.value === "";
    });
    return !haveValidatedInputs;
  }

  submitActionHandler = (event) => {
    const requestParams = this.prepareRequestJson();
    const isInputValidated = this.validateInputs(this.props.response);
    isInputValidated && this.props.submitInputs(this.props.response);
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <TopNavigation />
        <MainContainer {...this.props} />
        <BottomNavigation submitAction={this.submitActionHandler} />
      </ThemeProvider>
    );
  }
}

const mapStateToProps = (state) => ({
  response: state.response,
})

const mapDispatchToProps = dispatch => ({
  fetchUIControls: () => dispatch(fetchUIRenderData()),
  submitInputs: (formData) => dispatch(submitInputData(formData)),
  updateTabs: (tabItems) => dispatch({ type: constants.UPDATE_TABS, data: tabItems }),
  updateMetaData: (inputControls) => dispatch({ type: constants.UPDATE_METADATA, data: inputControls }),
  updateDependencyList: (dependency) => dispatch({ type: constants.UPDATE_DEPENDENCY_LIST, data: dependency }),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
