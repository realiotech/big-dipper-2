import Trans from 'next-translate/Trans';
import { ComponentProps, useMemo } from 'react';

/**
 * This component is used to translate the i18nKey with the app name prefix.
 */
const AppTrans = (props: ComponentProps<typeof Trans>) => {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? '';
  const { i18nKey, ...propsRest } = props;

  // return `Trans` component if `appName` is empty. i.e. for jest test.
  if (!appName) {
    return <Trans {...propsRest} i18nKey={i18nKey} />;
  }

  // return `Trans` component with `i18nKeysMerged` as `i18nKey` prop.
  return <Trans {...propsRest} i18nKey={i18nKey} />;
};

export default AppTrans;
