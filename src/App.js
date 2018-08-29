//@flow
import React, { Component } from 'react';
import Helmet from 'react-helmet';
import MarkdownEditor from './components/MarkdownEditor';
import PasswordDialog from './components/PasswordDialog';

import './assets/css/App.css';

const electron = window.require('electron');
const path = window.require('path');
const ipc = electron.ipcRenderer;

type State = {
  markdownContent: string,
  fileName: string,
  isPasswordDialogOpen: boolean,
  passError: boolean
};

class App extends Component<{}, State> {
  constructor() {
    super();
    this.state = {
      markdownContent: '',
      fileName: 'Untitled',
      isPasswordDialogOpen: false,
      passError: false
    };
  }

  handleEditorChange = (value: string) => {
    this.setState({ markdownContent: value });
  };
  loadFromFile = (event: any, openedFile: string, content: string) => {
    this.setState({
      markdownContent: content,
      fileName: openedFile,
      isPasswordDialogOpen: false,
      passError: false
    });
  };
  changeFileName = (event: any, savedFile: string) => {
    this.setState({
      fileName: savedFile
    });
  };

  onPasswordRequest = (event: any) => {
    this.setState({
      isPasswordDialogOpen: true
    });
  };

  onPasswordEntered = (pass: string) => {
    ipc.send('password-available', pass);
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
    });
    ipc.on('on-password-request', () =>
      this.setState({
        isPasswordDialogOpen: true,
        passError: false
      })
    );
    ipc.on('on-wrong-password', () =>
      this.setState({
        passError: true
      })
    );
  }

  componentWillUnmount() {
    ['file-opened', 'save-file', 'file-saved', 'on-password-request', 'on-wrong-password'].map(
      channel => ipc.removeAllListeners(channel)
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
        <PasswordDialog
          isOpen={this.state.isPasswordDialogOpen}
          error={this.state.passError}
          onPasswordEntered={this.onPasswordEntered}
        />
      </div>
    );
  }
}

export default App;
