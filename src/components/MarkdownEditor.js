//@flow
import React, { Component } from 'react';
import SplitPane from 'react-split-pane';
import { Controlled as CodeMirror } from 'react-codemirror2';
import ReactMarkdown from 'react-markdown';

require('codemirror/lib/codemirror.css');
require('codemirror/mode/markdown/markdown');
require('codemirror/theme/darcula.css');

type Props = {
  content: string,
  onChange(value: string): void
};

class MarkdownEditor extends Component<Props> {
  handleChange = (
    editor: CodeMirror.IInstance,
    data: CodeMirror.codemirror.EditorChange,
    value: string
  ) => this.props.onChange(value);

  render() {
    let options = {
      mode: 'markdown',
      theme: 'darcula'
    };
    return (
      <SplitPane split="vertical" defaultSize="50%">
        <div className="editor-pane">
          <CodeMirror
            value={this.props.content}
            onBeforeChange={this.handleChange}
            options={options}
            height="100%"
          />
        </div>
        <div className="preview-pane">
          <ReactMarkdown class="markdown-preview" source={this.props.content} />
        </div>
      </SplitPane>
    );
  }
}

export default MarkdownEditor;
