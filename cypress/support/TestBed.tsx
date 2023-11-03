import '../../src/index.css';

import type { PropsWithChildren } from 'react';

function TestBed(props: PropsWithChildren) {
  return (
    <main>
      <h1 className="tw-mb-1 tw-block tw-border-b-2 tw-border-gray-50 tw-bg-amber-500 tw-text-center tw-text-9xl tw-font-bold tw-text-gray-50 hover:tw-border-white hover:tw-bg-amber-600 hover:tw-text-white">
        TestBed
      </h1>
      {props.children}
    </main>
  );
}

export default TestBed;
