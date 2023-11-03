import '../../src/index.css';

import type { PropsWithChildren } from 'react';

function TestBed(props: PropsWithChildren) {
  return (
    <main>
      <h1 className="tw-mb-1 tw-block tw-border-b-2 tw-border-warning tw-bg-warning tw-text-center tw-text-9xl tw-font-bold tw-text-warning hover:tw-border-warning-hover hover:tw-bg-warning-hover hover:tw-text-warning-hover">
        TestBed
      </h1>
      {props.children}
    </main>
  );
}

export default TestBed;
