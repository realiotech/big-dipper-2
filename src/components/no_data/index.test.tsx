import React from 'react';
import renderer from 'react-test-renderer';
import { MockTheme } from '@tests/utils';
import {
  NoData,
} from '@components';
import { RecoilRoot } from 'recoil';

// ==================================
// mocks
// ==================================
const mockI18n = {
  t: (key: string) => key,
  lang: 'en',
};
jest.mock('next-translate/useTranslation', () => () => mockI18n);

// ==================================
// unit tests
// ==================================
describe('component: NoData', () => {
  it('matches snapshot', () => {
    const component = renderer.create(
      <RecoilRoot>
        <MockTheme>
          <NoData />
        </MockTheme>
      </RecoilRoot>,
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
