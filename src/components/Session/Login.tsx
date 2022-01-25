import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { RootState } from 'src/model/types';
import { getLoginStatus } from 'src/model/selectors/users';
import { isEmail } from 'src/model/utils/Utils';
import { onUserLoginAction, googleLoginAction, getUserAuthStatusAction } from 'src/model/actions/users';
import { FooterWrapper } from './FooterWrapper';
import { GoogleButton } from '../Common/GoogleButton';
import Wrapper from './Wrapper';

interface LoginProps {
  history: {
    push: (url: string) => void;
  };
}

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps & LoginProps;

interface LoginState {
  email: string;
  emailError: boolean;
  passkey: string;
  passkeyError: boolean;
  rememberMe: boolean;
}

export class Login extends Component<Props, LoginState> {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      passkey: '',
      rememberMe: false,
      emailError: false,
      passkeyError: false,
    };

    this.onFormSubmitHandler = this.onFormSubmitHandler.bind(this);
    this.onEmailChangeHandler = this.onEmailChangeHandler.bind(this);
    this.onPasskeyChangeHandler = this.onPasskeyChangeHandler.bind(this);
    this.onEmailBlurHandler = this.onEmailBlurHandler.bind(this);
    this.onPasskeyChangeHandler = this.onPasskeyChangeHandler.bind(this);
    this.onPasskeyBlurHandler = this.onPasskeyBlurHandler.bind(this);
    this.onRememberMeChangeHandler = this.onRememberMeChangeHandler.bind(this);
  }

  componentDidUpdate(prevProps): void {
    const { loginStatus, history, isUserAuthenthicated } = this.props;
    if (loginStatus === 'authenticated' && prevProps.loginStatus !== loginStatus) {
      history.push('/');
      isUserAuthenthicated();
    }
  }

  onFormSubmitHandler(): void {
    const { email, passkey, rememberMe } = this.state;
    this.props.onUserLogin({
      email,
      password: passkey,
      rememberMe,
    });
  }

  onEmailChangeHandler(event): void {
    this.setState({
      email: event.target.value,
      emailError: !isEmail(event.target.value),
    });
  }

  onEmailBlurHandler(): void {
    const { email, emailError } = this.state;
    if (!isEmail(email) && !emailError) {
      this.setState({
        emailError: true,
      });
    }
  }

  onPasskeyChangeHandler(event): void {
    this.setState({
      passkey: event.target.value,
      passkeyError: event.target.value.toString().length < 3,
    });
  }

  onPasskeyBlurHandler(): void {
    const { passkeyError, passkey } = this.state;
    if (passkey.toString().length < 3 && !passkeyError) {
      this.setState({
        passkeyError: true,
      });
    }
  }

  onRememberMeChangeHandler(): void {
    this.setState((state) => ({
      rememberMe: !state.rememberMe,
    }));
  }

  render() {
    const isLoading: boolean = this.props.loginStatus === 'loading';
    const { googleLogin } = this.props;
    const { passkey, email, emailError, passkeyError, rememberMe } = this.state;
    return (
      <Wrapper title="Login">
        <div className="field-wrapper">
          <TextField
            autoFocus
            fullWidth
            required
            id="email"
            label="E-mail"
            type="email"
            autoComplete="new-email"
            name="new-email"
            helperText="Invalid e-mail"
            onChange={this.onEmailChangeHandler}
            value={email}
            disabled={isLoading}
            error={emailError}
            onBlur={this.onEmailBlurHandler}
          />
        </div>
        <div className="field-wrapper">
          <TextField
            fullWidth
            required
            id="passkey"
            type="password"
            label="Passkey"
            autoComplete="new-password"
            name="new-password"
            helperText={passkeyError ? 'Passkey is required' : null}
            disabled={isLoading}
            value={passkey}
            error={passkeyError}
            onChange={this.onPasskeyChangeHandler}
            onBlur={this.onPasskeyBlurHandler}
          />
          {passkeyError && (
            <Link to="/reset-passkey" className="field-url">
              Forgot Passkey?
            </Link>
          )}
        </div>
        <div className="field-wrapper">
          <FormControlLabel
            className="checkbox-label"
            control={<Checkbox checked={rememberMe} onChange={this.onRememberMeChangeHandler} color="primary" />}
            label="Remember Me"
          />
        </div>
        <div className="button-wrapper">
          <Button
            className="button"
            fullWidth
            variant="contained"
            disabled={isLoading}
            color="primary"
            type="button"
            onClick={this.onFormSubmitHandler}
            id="loginBtn"
          >
            {isLoading && <CircularProgress color="secondary" size={28} />}
            <span>Login</span>
          </Button>
        </div>
        <FooterWrapper>
          <p>
            Don’t have an account? <Link to="/register">Register</Link>.
          </p>
        </FooterWrapper>
        <FooterWrapper>
          <p>- or -</p>
        </FooterWrapper>
        <FooterWrapper>
          <GoogleButton onUserSelect={googleLogin} text="Sign In with Google" />
        </FooterWrapper>
      </Wrapper>
    );
  }
}

const mapState = (state: RootState) => ({
  loginStatus: getLoginStatus(state),
});

const mapDispatch = (dispatch: Function) => ({
  onUserLogin: (userData) => dispatch(onUserLoginAction(userData)),
  googleLogin: (userData) => dispatch(googleLoginAction(userData)),
  isUserAuthenthicated: () => dispatch(getUserAuthStatusAction()),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(Login);
