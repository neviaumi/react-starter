import './App.css';

import type React from 'react';
import { useLayoutEffect, useRef, useState } from 'react';

function converge(
  finalFunction: (element: HTMLInputElement, errors: string[]) => void,
  listOfFunction: ((e: React.ChangeEvent<HTMLInputElement>) => unknown)[],
) {
  return function eventHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const result: string[] = listOfFunction
      .map(fn => fn(e))
      .filter(error => error) as string[];
    return finalFunction(e.target, result);
  };
}

function App() {
  const nameInput = useRef<HTMLInputElement>(null);
  const [nameInputError, setNameInputError] = useState<string | null>(null);
  function checkHasFirstNameAndLastName(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const value = e.target.value;
    const [firstName = '', lastName = ''] = value.split(' ');
    if (e.target.validity.valueMissing) {
      return null;
    }
    if (!firstName || !lastName) {
      return 'Please enter your first name and last name';
    }
    return null;
  }

  function checkFirstNameLength(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const [firstName = ''] = value.split(' ');
    if (e.target.validity.valueMissing) {
      return '';
    }
    if (!firstName || firstName.length < 3) {
      return 'first name should more than length 3';
    }
    return '';
  }

  function checkLastNameLength(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const [lastName = ''] = value.split(' ');
    if (e.target.validity.valueMissing) {
      return '';
    }
    if (!lastName || lastName.length < 5) {
      return 'last name should more than length 5';
    }
    return '';
  }
  function syncNameInputError(element: HTMLInputElement, errors: string[]) {
    // Workaround to trigger re-render
    const input = element;
    const isNameInputError = !input.validity.valid;
    if (isNameInputError) {
      if (input.validity.valueMissing) {
        setNameInputError('Please enter your name');
        element.setCustomValidity('Please enter your name');
        return;
      }
      if (errors.length > 0) {
        console.log(errors);
        setNameInputError(errors[0]);
        element.setCustomValidity(errors[0]);
        return;
      }
      setNameInputError(null);
      element.setCustomValidity('');
      return;
    }
  }
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    formData.forEach((value, key) => {
      console.log(key, value);
    });
  }
  useLayoutEffect(() => {
    if (!nameInput.current) return;
    syncNameInputError(nameInput.current, []);
  }, []);
  return (
    <>
      <h1>User Register</h1>
      <form
        className={'userRegisterForm'}
        id={'user-register-form'}
        onSubmit={onSubmit}
      >
        <fieldset>
          <label htmlFor={'name'}>Name</label>
          <input
            id={'name'}
            name={'name'}
            onInput={converge(syncNameInputError, [
              checkFirstNameLength,
              checkHasFirstNameAndLastName,
              checkLastNameLength,
            ])}
            placeholder={' '}
            ref={nameInput}
            required
            type="text"
          />
          {nameInputError && <span role={'status'}>{nameInputError}</span>}
        </fieldset>
        <fieldset className={'radio-group'} name={'gender'} role={'radiogroup'}>
          <label className={'fieldset-caption'}>Gender</label>
          <span>
            <input
              id={'gender-male'}
              name={'gender'}
              required
              type={'radio'}
              value={'Male'}
            />
            <label htmlFor={'gender-male'}>Male</label>
            <input
              id={'gender-female'}
              name={'gender'}
              required
              type={'radio'}
              value={'Female'}
            />
            <label htmlFor={'gender-female'}>Female</label>
          </span>
        </fieldset>
        <button type={'submit'}>Submit</button>
      </form>
    </>
  );
}

export default App;
