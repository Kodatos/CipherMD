import React from 'react';
import ReactDOM from 'react-dom';
import MarkdownEditor from './components/MarkdownEditor';
import PasswordDialog from './components/PasswordDialog';

//Stub for running codemirror
global.document.body.createTextRange = function() {
  return {
    setEnd: function() {},
    setStart: function() {},
    getBoundingClientRect: function() {
      return { right: 0 };
    },
    getClientRects: function() {
      return {
        length: 0,
        left: 0,
        right: 0
      };
    }
  };
};
it('renders MarkdownEditor without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MarkdownEditor />, div);
  ReactDOM.unmountComponentAtNode(div);
});
it('renders Password dialog without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<PasswordDialog />, div);
  ReactDOM.unmountComponentAtNode(div);
});