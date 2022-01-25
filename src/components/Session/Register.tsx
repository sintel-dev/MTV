import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { connect } from 'react-redux';
import { registerUserAction, googleRegisterAction } from 'src/model/actions/users';
import { registerStatus, googleRegisterStatus } from 'src/model/selectors/users';
import { RootState } from 'src/model/types';
import { isEmail, isName } from 'src/model/utils/Utils';
import { FooterWrapper } from './FooterWrapper';
import { GoogleButton } from '../Common/GoogleButton';
import Wrapper from './Wrapper';
import './Login.scss';

type RegisterState = {
  name: string;
  nameError: boolean;
  email: string;
  emailError: boolean;
};

type OwnProps = {
  history: {
    push: (url: string) => void;
  };
};

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type RegisterProps = StateProps & DispatchProps & OwnProps;

export class Register extends Component<RegisterProps, RegisterState> {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      email: '',
      nameError: false,
      emailError: false,
    };

    this.onNameChangeHandler = this.onNameChangeHandler.bind(this);
    this.onNameBlurHandler = this.onNameBlurHandler.bind(this);
    this.onEmailChangeHandler = this.onEmailChangeHandler.bind(this);
    this.onEmailBlurHandler = this.onEmailBlurHandler.bind(this);
    this.onUserRegister = this.onUserRegister.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.googleRegisterStatus !== prevProps.googleRegisterStatus &&
      this.props.googleRegisterStatus === 'success'
    ) {
      this.props.history.push('/');
      // this.props.fetchCurrentUser();
    }
  }

  onNameChangeHandler({ target }): void {
    this.setState({
      name: target.value,
      nameError: target.value.toString().length < 3 || !isName(target.value),
    });
  }

  onNameBlurHandler(): void {
    const { name, nameError } = this.state;
    if ((name.toString().length < 3 || !isName(name)) && !nameError) {
      this.setState({
        nameError: true,
      });
    }
  }

  onEmailChangeHandler({ target }): void {
    this.setState({
      email: target.value,
      emailError: !isEmail(target.value),
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

  onUserRegister() {
    const { name, email } = this.state;
    this.props.register({ name, email });
  }

  render() {
    if (this.props.registerStatus === 'success') {
      return (
        <Wrapper success>
          <div className="success-wrapper">
            <p>
              You will receive an e-mail shortly at <strong>{this.state.email}</strong> with your passkey.
            </p>
            <p>
              Please follow the instructions and then <Link to="/">log in</Link>.
            </p>
          </div>
        </Wrapper>
      );
    }
    const isLoading = this.props.registerStatus === 'loading';

    return (
      <Wrapper title="Register">
        <div className="field-wrapper">
          <TextField
            autoFocus
            fullWidth
            required
            id="name"
            type="text"
            label="Name"
            name="new-name"
            helperText={this.state.nameError ? 'Name is required' : null}
            disabled={isLoading}
            value={this.state.name}
            error={this.state.nameError}
            onChange={this.onNameChangeHandler}
            onBlur={this.onNameBlurHandler}
          />
        </div>
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
            type="button"
            disabled={isLoading}
            onClick={this.onUserRegister}
          >
            {isLoading && <CircularProgress color="secondary" size={28} />}
            <span>Register</span>
          </Button>
        </div>
        <FooterWrapper>
          <p>
            Already have an account? <Link to="/">Log in</Link>.
          </p>
        </FooterWrapper>
        <FooterWrapper>
          <p>- or -</p>
        </FooterWrapper>
        <FooterWrapper>
          <GoogleButton onUserSelect={this.props.googleRegister} text="Sign Up with Google" />
        </FooterWrapper>
      </Wrapper>
    );
  }
}

const mapState = (state: RootState) => ({
  registerStatus: registerStatus(state),
  googleRegisterStatus: googleRegisterStatus(state),
});

const mapDispatch = (dispatch: Function) => ({
  register: (data) => dispatch(registerUserAction(data)),
  googleRegister: (userData) => dispatch(googleRegisterAction(userData)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(Register);
