import { FormControl } from '@mui/base/FormControl';
import type { SelectOwnerState } from '@mui/base/Select';
import {useForm, Controller} from "react-hook-form"
import clsx from 'clsx';
import {useState} from "react"

import { Select, SelectOption } from './Select.tsx';

function App() {
    const {handleSubmit, control} = useForm({
        shouldUseNativeValidation: true,
        mode: 'onChange'
    })
    const [formValues, setFormValues] = useState({})

  return (<>
          <pre>{JSON.stringify(formValues, null, 4)}</pre>
    <form onSubmit={handleSubmit(setFormValues)}>
        <Controller rules={{
            required: "Must select one of the CarBrands"
        }} control={control} render={({field, fieldState}) => {
            const { disabled, name, onBlur, onChange, ref, value } =
                field;
            return (      <FormControl disabled={disabled}
                                       error={fieldState.invalid}
                                       onBlur={onBlur}
                                       onChange={onChange}
                                       className={'tw-relative tw-flex tw-w-fit'} // Uncomment that, it would fix the input validation layout
                                       value={value}>
                    <label>Car brand</label>
                    <Select
                        name={name}
                        ref={ref}
                        slotProps={{
                            listbox: {
                                className: clsx(
                                    'tw-border-primary tw-m-0 tw-mt-1 tw-flex tw-w-30 tw-flex-col tw-border-2 tw-pt-0.5',
                                ),
                            },
                            popper: {
                                className: clsx('tw-z-10'),
                            },
                            root: (state: SelectOwnerState<string, false>) => {
                                if (state.open)
                                    return {
                                        className: clsx(
                                            "tw-bg-disabled tw-text-disabled tw-w-30 tw-cursor-default tw-border-0 tw-px-2 tw-py-1 after:tw-float-right after:tw-content-['▴']",
                                        ),
                                    };
                                return {
                                    className: clsx(
                                        "tw-border-primary tw-text-primary tw-w-30 tw-border tw-bg-white tw-px-2 tw-py-1 after:tw-float-right after:tw-content-['▾']",
                                    ),
                                };
                            },
                        }}
                    >
                        <SelectOption value={'Toyota'}>Toyota</SelectOption>
                        <SelectOption value={'BMW'}>BMW</SelectOption>
                        <SelectOption value={'Honda'}>Honda</SelectOption>
                        <SelectOption value={'Fiat'}>Fiat</SelectOption>
                        <SelectOption value={'Mini'}>Mini</SelectOption>
                    </Select>
                </FormControl>
            )
        }} name={"carBrand"}/>
        <button type={"submit"}>Submit</button>
    </form></>
  );
}

export default App;
