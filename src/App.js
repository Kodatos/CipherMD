//@flow
import React, { Component } from 'react';
import MarkdownEditor from './components/MarkdownEditor';
import './css/App.css';

const electron = window.require('electron');
const ipc = electron.ipcRenderer;

type State = {
  markdownContent: string
};

class App extends Component<{}, State> {
  constructor() {
    super();
    this.state = {
      markdownContent: ''
    };
  }

  handleEditorChange = (value: string) =>
    this.setState({ markdownContent: value });
  loadFromFile = (event: any, content: string) =>
    this.setState({ markdownContent: content });

  componentDidMount() {
    ipc.on('file-opened', this.loadFromFile);
    ipc.on('save-file', () =>
      ipc.send('on-content-received', this.state.markdownContent)
    );
  }

  componentWillUnmount() {
    ['file-opened', 'save-file'].map(channel =>
      ipc.removeAllListeners(channel)
    );
  }

  render() {
    return (
      <MarkdownEditor
        content={this.state.markdownContent}
        onChange={this.handleEditorChange}
      />
    );
  }
}

export default App;
