import React, { Component } from 'react';
import SplitPane from 'react-split-pane';
import { Controlled as CodeMirror } from 'react-codemirror2';
import ReactMarkdown from 'react-markdown';

require('codemirror/lib/codemirror.css');
require('codemirror/mode/markdown/markdown');
require('codemirror/theme/darcula.css');

class MarkdownEditor extends Component {
  constructor(props) {
    super();
    this.state = { value: '' };
    this.handleChange = (event, data, value) => this.setState({ value: value });
  }

  render() {
    let options = {
      mode: 'markdown',
      theme: 'darcula'
    };
    return (
      <SplitPane split="vertical" defaultSize="50%">
        <div className="editor-pane">
          <CodeMirror
            value={this.state.value}
            onBeforeChange={this.handleChange}
            options={options}
            height="100%"
          />
        </div>
        <div className="preview-pane">
          <ReactMarkdown class="markdown-preview" source={this.state.value} />
        </div>
      </SplitPane>
    );
  }
}

export default MarkdownEditor;
