//@flow
import React, { Component } from 'react';
import MarkdownEditor from './components/MarkdownEditor';
import './css/App.css';

const electron = window.require('electron');
const ipc = electron.ipcRenderer;

ipc.on('file-opened', (contents: string) => {});

type State = {
  markdownContent: string
};

class App extends Component<{}, State> {
  constructor(props: {}) {
    super();
    this.state = {
      markdownContent: ''
    };
  }
  
  handleChange = (value: string) => this.setState({markdownContent: value});

  render() {
    return <MarkdownEditor content={this.state.markdownContent} onChange={this.handleChange} />;
  }
}

export default App;
