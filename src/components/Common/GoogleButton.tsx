import React, { Component } from 'react';
import GoogleLogin from 'react-google-login';
import { GOOGLE_CLIEN_ID } from '../../model/utils/constants';

import './google-button.scss';

type userPayload = {
  email: string;
  name: string;
  gid: string;
  picture: string;
};

interface GoogleButtonProps {
  text: string;
  onUserSelect?: (userData) => void;
}

export class GoogleButton extends Component<GoogleButtonProps> {
  render() {
    const responseGoogleSucces = (response) => {
      if (response.error) {
        return;
      }
      const { email, name, googleId, imageUrl } = response.profileObj;

      const payload: userPayload = {
        email,
        name,
        gid: googleId,
        picture: imageUrl,
      };
      this.props.onUserSelect(payload);
    };
    return (
      <div className="google-login-wrapper">
        <GoogleLogin
          clientId={GOOGLE_CLIEN_ID}
          buttonText="Login"
          onSuccess={responseGoogleSucces}
          onFailure={responseGoogleSucces}
          cookiePolicy="single_host_origin"
          onAutoLoadFinished={(message) => message}
        >
          {this.props.text}
        </GoogleLogin>
      </div>
    );
  }
}
