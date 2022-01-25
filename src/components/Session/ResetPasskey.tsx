import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import { onUserResetPassKey } from 'src/model/actions/users';
import { getPasswordResetStatus } from 'src/model/selectors/users';
import { Link } from 'react-router-dom';
import { RootState } from 'src/model/types';
import { isEmail } from '../../model/utils/Utils';
import Wrapper from './Wrapper';

interface ResetPasskeyState {
  email: string;
  emailError: boolean;
}

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

// @TODO - check to see if it's needed, not in use at the moment
class ResetPassKey extends Component<Props, ResetPasskeyState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      email: '',
      emailError: false,
    };
    this.onEmailChangeHandler = this.onEmailChangeHandler.bind(this);
    this.onEmailBlurHandler = this.onEmailBlurHandler.bind(this);
    this.onFormSubmitHandler = this.onFormSubmitHandler.bind(this);
  }

  onEmailChangeHandler({ target }): void {
    this.setState({
      email: target.value,
    });
  }

  onEmailBlurHandler(): void {
    const { emailError, email } = this.state;
    if (!isEmail(email) && !emailError) {
      this.setState({
        emailError: true,
      });
    }
  }

  onFormSubmitHandler(): void {
    this.props.resetPasskey({
      email: this.state.email,
    });
  }

  render() {
    if (this.props.resetPassKyeStatus === 'success') {
      return (
        <Wrapper success>
          <div className="success-wrapper">
            <p>
              If this e-mail is associated to an account, you will receive an e-mail shortly at{' '}
              <strong>{this.state.email}</strong> with your new passkey.
            </p>
            <p>
              Please follow the instructions and then <Link to="/">log in</Link>.
            </p>
          </div>
        </Wrapper>
      );
    }

    const isLoading = this.props.resetPassKyeStatus === 'loading';
    return (
      <Wrapper title="Reset PASSKEY">
        <div className="field-wrapper">
          <TextField
            fullWidth
            required
            id="email"
            label="E-mail"
            type="email"
            name="new-email"
            helperText={this.state.emailError ? 'Invalid e-mail' : null}
            disabled={isLoading}
            value={this.state.email}
            error={this.state.emailError}
            onChange={this.onEmailChangeHandler}
            onBlur={this.onEmailBlurHandler}
          />
        </div>
        <div className="button-wrapper">
          <Button
            className="button"
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            onClick={this.onFormSubmitHandler}
          >
            {isLoading && <CircularProgress color="secondary" size={28} />}
            <span>Reset Passkey</span>
          </Button>
        </div>
      </Wrapper>
    );
  }
}

const mapState = (state: RootState) => ({
  resetPassKyeStatus: getPasswordResetStatus(state),
});

const mapDispatch = (dispatch: Function) => ({
  resetPasskey: (userEmail) => dispatch(onUserResetPassKey(userEmail)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(ResetPassKey);
