import { useFormControlContext } from '@mui/base/FormControl';
import {
  Option as MuiOption,
  type OptionOwnerState,
  type OptionOwnProps,
} from '@mui/base/Option';
import {
  Select as MuiSelect,
  type SelectOwnerState,
  type SelectOwnProps,
} from '@mui/base/Select';
import clsx from 'clsx';
import React, { forwardRef, useCallback, useEffect } from 'react';

export const Select = forwardRef(function Select(
  { slotProps, ...rest }: SelectOwnProps<string, false>,
  ref,
) {
  const formControlContext = useFormControlContext();
  const name = rest.name;
  const connectMuiSelectToFormContext = useCallback(
    (_: unknown, value: string | null) => {
      if (!formControlContext?.onChange) return;
      formControlContext.onChange({
        target: { value },
      } as any);
    },
    [formControlContext],
  );

  useEffect(() => {
    const inputElement = document.querySelector(`input[name="${name}"]`);
    if (!inputElement || !ref) return;
    typeof ref === 'function' && ref(inputElement);
  }, [name, ref]);

  return (
    <>
      <MuiSelect
        name={name}
        onChange={connectMuiSelectToFormContext}
        slotProps={slotProps}
        value={formControlContext?.value as string}
        {...rest}
      />
    </>
  );
});

export function SelectOption({ value, ...rest }: OptionOwnProps<string>) {
  return (
    <MuiOption
      {...rest}
      data-value={value}
      slotProps={{
        root: (state: OptionOwnerState<string>) => {
          let className = '';
          if (state.disabled)
            className = clsx(
              'tw-bg-disabled tw-text-disabled tw-cursor-default tw-text-center',
            );
          else if (state.selected)
            className = clsx(
              'tw-bg-primary tw-text-primary tw-cursor-default tw-text-center tw-font-bold',
            );
          else
            className = clsx(
              'tw-text-primary hover:tw-bg-primary hover:tw-text-primary tw-cursor-default tw-bg-white tw-px-1 tw-text-center hover:tw-cursor-pointer',
            );
          return {
            className,
          };
        },
      }}
      value={value}
    />
  );
}
