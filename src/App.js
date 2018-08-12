//@flow
import React, { Component } from 'react';
import Helmet from 'react-helmet';
import MarkdownEditor from './components/MarkdownEditor';
import './css/App.css';

const electron = window.require('electron');
const path = window.require('path');
const ipc = electron.ipcRenderer;

type State = {
  markdownContent: string,
  fileName: string
};

class App extends Component<{}, State> {
  constructor() {
    super();
    this.state = {
      markdownContent: '',
      fileName: 'Untitled'
    };
  }

  handleEditorChange = (value: string) => {
    this.setState({ markdownContent: value });
  };
  loadFromFile = (event: any, openedFile: string, content: string) => {
    this.setState({
      markdownContent: content,
      fileName: openedFile
    });
  };
  changeFileName = (event: any, savedFile: string) => {
    this.setState({
      fileName: savedFile
    });
  };

  componentDidMount() {
    ipc.on('file-opened', this.loadFromFile);
    ipc.on('save-file', () => {
      ipc.send(
        'on-content-received',
        this.state.fileName,
        this.state.markdownContent
      );
      ipc.once('file-saved', this.changeFileName);
    }
    );
  }

  componentWillUnmount() {
    ['file-opened', 'save-file'].map(channel =>
      ipc.removeAllListeners(channel)
    );
  }

  render() {
    return (
      <div id="application">
        <Helmet>
          <title>{path.basename(this.state.fileName) + ' - CipherMD'}</title>
        </Helmet>
        <MarkdownEditor
          content={this.state.markdownContent}
          onChange={this.handleEditorChange}
        />
      </div>
    );
  }
}

export default App;
