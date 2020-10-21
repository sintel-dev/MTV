import React, { Component } from 'react';
import { connect } from 'react-redux';
import { onUserLogoutAction } from 'src/model/actions/users';
import LinearProgress from '@material-ui/core/LinearProgress';
import { getLoginStatus } from 'src/model/selectors/users';
import { RootState } from 'src/model/types';
import Wrapper from './Wrapper';

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

class Logout extends Component<Props> {
  componentDidMount() {
    this.props.userLogout();
    window.location.href = '/';
  }

  componentDidUpdate(): void {
    if (this.props.loginStatus === 'unauthenticated') {
      window.location.href = '/';
    }
  }

  render() {
    return (
      <Wrapper title="Logout" description="You will be redirected after logout.">
        <LinearProgress />
      </Wrapper>
    );
  }
}

const mapState = (state: RootState) => ({
  loginStatus: getLoginStatus(state),
});

const mapDispatch = (dispatch: Function) => ({
  userLogout: () => dispatch(onUserLogoutAction()),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(Logout);
