import { Image } from '@busybox/react-components/Image';
import { Header, Page } from '@busybox/react-components/Layout';
import type { PropsWithChildren } from 'react';

import PSNIcon from './psn_icon.svg';
import SonyIcon from './sony_logo.svg';

function Heading() {
  return (
    <Header className={'tw-container tw-mx-auto 2xl:tw-max-w-full'}>
      <div className={'tw-flex tw-h-4 tw-justify-end tw-bg-black tw-p-1'}>
        <Image className={'tw-w-12'} src={SonyIcon} />
      </div>
      <div className={'tw-flex tw-items-center tw-gap-1 tw-py-1 tw-pl-1'}>
        <Image className={'tw-w-6'} src={PSNIcon} />
        <h1 className={'tw-text-6xl tw-font-bold tw-text-gray-600'}>
          Game Library
        </h1>
      </div>
    </Header>
  );
}

export default function Layout({ children }: PropsWithChildren<unknown>) {
  return (
    <>
      <Heading />
      <Page className={'tw-mx-auto 2xl:tw-max-w-full'}>{children}</Page>
    </>
  );
}
