//@flow
import React, { Component} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

type Props = {
  isOpen: boolean,
  onPasswordEntered(pass: string): void
};

type State = {
  pass: string,
  error: boolean
};

class PasswordDialog extends Component<Props, State> {
  constructor() {
    super();
    this.state = {
      pass: '',
      error: false
    };
  }

  handleChange = (event: SyntheticEvent<any>) =>
    this.setState({
      pass: event.currentTarget.value
    });

  handlePasswordEntered = () => {
    this.props.onPasswordEntered(this.state.pass);
  }

  render() {
    return (
      <div>
        <Dialog open={this.props.isOpen}>
          <DialogContent>
            <DialogContentText> Please enter your password </DialogContentText>
            <TextField
              autoFocus
              id="pass"
              type="password"
              value={this.state.pass}
              onChange={this.handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handlePasswordEntered}>Enter</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default PasswordDialog;
