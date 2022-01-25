import React from 'react';
import { renderWithStore, TestWrapper } from 'src/tests/utils';
import Loader from './Loader';

describe('Testing Loader component', () => {
  const children = <div className="children">Content to be displayed after `isLoading` is false</div>;
  it('Should render without crashing', () => {
    const loaderComponent = renderWithStore(
      {},
      <TestWrapper>
        <Loader isLoading />
      </TestWrapper>,
    );
    expect(loaderComponent).toMatchSnapshot();
  });

  it('Should render children after loading is false', () => {
    const loaderComponent = renderWithStore(
      {},
      <TestWrapper>
        <Loader isLoading={false}>{children}</Loader>
      </TestWrapper>,
    );
    expect(loaderComponent).toMatchSnapshot();
  });
});
