import React, { Component } from 'react';
import withStyles from 'react-jss';
import { CompactPicker } from 'react-color';
import { addUrlProps, UrlQueryParamTypes } from 'react-url-query';

import './App.css';

const urlPropsQueryConfig = {
  numbers: { type: UrlQueryParamTypes.string, queryParam: 'numbers' },
};

const styles = {
  root: {
    display: 'flex',
    flexFlow: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: 20
  },
  text: {
    fontSize: '3em',
    margin: 0,
  },
  textArea: {
    width: '30%',
    height: 200,
    textAlign: 'center',
    marginBottom: 10,
    minWidth: 400,
    fontSize: '2em'
  },
  display: {
    fontFamily: 'PT Mono',
    color: 'red',
    fontSize: "10em",
    margin: 0,
    lineHeight: 0,
  }
}


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nums: [],
      textarea: "",
      currentNum: null,
      currentIndex: null,
      background: 'white',
      textColor: '#d33115'
    }

  }

  handleBg = (color) => {
    this.setState({ background: color.hex });
  };
  handleText = (color) => {
    this.setState({ textColor: color.hex });
  };

  changeText = (e) => {
    this.setState({
      textarea: e.target.value
    })
  }

  clickButton = () => {
    const temp = this.state.textarea.replace(" ","").split('\n');
    window.location = `/?numbers=${temp.join(',')}`
  }

  _handleKeyDown = (e) => {
    if (e.keyCode == 39) {
      if (! (this.state.currentIndex === this.state.nums.length - 1)) {
        this.setState({
            currentNum: this.state.nums[this.state.currentIndex + 1],
            currentIndex: this.state.currentIndex + 1
        })
      }
    } else if (e.keyCode == 37) {
      if(! (this.state.currentIndex === 0)) {
        this.setState({
          currentNum: this.state.nums[this.state.currentIndex - 1],
          currentIndex: this.state.currentIndex - 1
        })
      }
    }
  }

  componentDidMount = () => {
    if (this.props.numbers) {
      const n = this.props.numbers.replace(" ", "").split(",");
      this.setState({
        nums: n,
        currentNum: n[0],
        currentIndex: 0
      });
    }
    document.addEventListener("keydown", this._handleKeyDown);
  }

  componentWillUnmount = () => {
    document.removeEventListener("keydown", this._handleKeyDown);
  }

  render() {
    if (this.state.nums.length == 0) {
      return (
        <div className={this.props.classes.root}>
          <h1 className={this.props.classes.text}>Separate Numbers By Line</h1>
          <textarea className={this.props.classes.textArea} onChange={this.changeText} />
          <div style={{display: 'flex', margin: 20}}>
            <div style={{marginRight: 20}}>
            <h1>Background</h1>
            <CompactPicker  color={ this.state.background }
          onChangeComplete={ this.handleBg }/>
            </div>
            <div>
            <h1>Text</h1>
            <CompactPicker  color={ this.state.textColor }
          onChangeComplete={ this.handleText } />
            </div>
          </div>
          <button style={{fontSize:'2em', borderRadius: 10, padding: 20}} onClick={this.clickButton}> Finish </button>
          <p>Use Arrow Keys to Navigate. Ctrl +/- to zoom in and out.</p>

        </div>
      );
    } else {
      return (
        <div className={this.props.classes.root} style={{background: this.state.background}}>
          <h1 className={this.props.classes.display} style={{color: this.state.textColor}}>{this.state.currentNum}</h1>
        </div>
      )
    }
  }
}

export default (withStyles(styles)(addUrlProps({ urlPropsQueryConfig })(App)));
