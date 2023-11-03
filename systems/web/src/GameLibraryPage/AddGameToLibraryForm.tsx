import { gql, useMutation } from '@apollo/client';
import { Button } from '@busybox/react-components/Button';
import { DateInput } from '@busybox/react-components/DateInput';
import { Field } from '@busybox/react-components/Field';
import { FileUploadInput } from '@busybox/react-components/FileUploadInput';
import { Image } from '@busybox/react-components/Image';
import { Label } from '@busybox/react-components/Label';
import {
  Modal,
  ModalContent,
  ModalTitle,
} from '@busybox/react-components/Modal';
import { NumberInput } from '@busybox/react-components/NumberInput';
import { Select, SelectOption } from '@busybox/react-components/Select';
import { TextInput } from '@busybox/react-components/TextInput';
import { type ChangeEvent, type PropsWithoutRef, useState } from 'react';
import {
  type Control,
  Controller,
  useController,
  useForm,
} from 'react-hook-form';

type AddGameToLibraryFormValues = {
  boxArtImageUrl: string;
  genre: string;
  name: string;
  numberOfPlayers: string;
  platform: string;
  publisher: string;
  releaseDate: string | null;
};
export function GameBoxArtUploadField({
  control,
  disabled = false,
}: PropsWithoutRef<{
  control: Control<AddGameToLibraryFormValues>;
  disabled?: boolean;
}>) {
  const PREPARE_UPLOAD_GAME_BOX_ART = gql`
    mutation uploadBoxArt($fileName: String!) {
      prepareUploadGameBoxArt(fileName: $fileName) {
        id
        resultPublicUrl
        uploadUrl
      }
    }
  `;
  const [prePareUploadGameBoxArt] = useMutation(PREPARE_UPLOAD_GAME_BOX_ART);
  const {
    field: { onChange, ref, value, ...hookFormFieldProps },
  } = useController({
    control: control,
    disabled,
    name: 'boxArtImageUrl',
    rules: {
      required: { message: 'box art must be provided', value: true },
    },
  });
  const uploadFileWhenInputChanged = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const [sourceFile]: FileList | Array<null> = event.target.files ?? [];
    if (!sourceFile) return;
    const { data, errors } = await prePareUploadGameBoxArt({
      variables: { fileName: sourceFile.name },
    });
    if (errors) return;
    await fetch(data.prepareUploadGameBoxArt.uploadUrl, {
      body: sourceFile,
      method: 'PUT',
    });
    onChange(data.prepareUploadGameBoxArt.resultPublicUrl);
  };
  return (
    <>
      <Field
        {...hookFormFieldProps}
        className={'tw-flex tw-flex-col tw-justify-center tw-gap-0.5'}
        onChange={uploadFileWhenInputChanged}
        ref={ref}
        value={value}
      >
        {value && (
          <div className={'tw-flex tw-justify-center'}>
            <Image
              className="tw-h-31.5 tw-w-31.5"
              data-testid="uploaded-image"
              src={value}
            />
          </div>
        )}
        <FileUploadInput
          className={'tw-items-center tw-justify-center'}
          data-testid={'game-box-art-file-upload'}
        >
          Upload Box Art{value && ' Again'}
        </FileUploadInput>
      </Field>
    </>
  );
}

function AddGameToLibraryModal({
  onModalClose,
  open,
}: {
  onModalClose?: (e: any, reason: string) => void;
  open: boolean;
}) {
  const ADD_GAME_TO_LIST = gql`
    mutation addGameToLibrary($data: AddGameToLibraryArgs!) {
      addGameToLibrary(data: $data) {
        id
      }
    }
  `;
  const [createGameMutation] = useMutation(ADD_GAME_TO_LIST);

  const { control, handleSubmit } = useForm<AddGameToLibraryFormValues>({
    defaultValues: {
      boxArtImageUrl: '',
      genre: 'FIGHTING',
      name: '',
      numberOfPlayers: '',
      platform: 'PS5',
      publisher: '',
      releaseDate: null,
    },
    mode: 'onBlur',
  });
  const submitFormValues = async (values: AddGameToLibraryFormValues) => {
    const data = {
      ...values,
      // Hardcoded user id for easily isolate records in DB
      userId: '1ec57d7a-67be-42d0-8a97-07e743e6efbc',
    };
    try {
      await createGameMutation({
        variables: {
          data,
        },
      });
    } catch (e) {
      return;
    }
    onModalClose?.(
      new CustomEvent('gameCreatedInLibrary', {
        detail: {
          gameCreated: data,
        },
      }),
      'submit',
    );
  };
  return (
    <Modal
      data-testid={'add-game-to-library-modal'}
      onClose={onModalClose}
      open={open}
    >
      <ModalTitle>Add game to your library</ModalTitle>
      <ModalContent className={'tw-w-full'}>
        <form
          className={'tw-flex tw-flex-col tw-justify-start'}
          onSubmit={handleSubmit(submitFormValues)}
        >
          <GameBoxArtUploadField control={control} />
          <Controller
            control={control}
            name={'name'}
            render={({ field }) => {
              return (
                <Field {...field} className={'tw-flex tw-flex-col tw-gap-0.5'}>
                  <Label>Name</Label>
                  <TextInput data-testid={'game-name-input'} />
                </Field>
              );
            }}
          />
          <Controller
            control={control}
            name={'publisher'}
            render={({ field }) => {
              return (
                <Field {...field} className={'tw-flex tw-flex-col tw-gap-0.5'}>
                  <Label>Publisher</Label>
                  <TextInput data-testid={'game-publisher-input'} />
                </Field>
              );
            }}
          />
          <Controller
            control={control}
            name={'platform'}
            render={({ field }) => {
              return (
                <Field {...field} className={'tw-flex tw-flex-col tw-gap-0.5'}>
                  <Label>Platform</Label>
                  <Select
                    data-testid={'game-platform-input'}
                    name={field.name}
                    slotProps={{
                      listbox: {
                        className: 'tw-w-30 tw-bg-white',
                        'data-testid': 'form-stories-select-options',
                      },
                      root: { className: 'tw-h-5 tw-w-30' },
                    }}
                    value={field.value}
                  >
                    <SelectOption
                      data-testid={'game-platform-input-ps4'}
                      value={'PS4'}
                    >
                      PS4
                    </SelectOption>
                    <SelectOption
                      data-testid={'game-platform-input-ps5'}
                      value={'PS5'}
                    >
                      PS5
                    </SelectOption>
                  </Select>
                </Field>
              );
            }}
          />
          <Controller
            control={control}
            name={'numberOfPlayers'}
            render={({ field: { onChange, ...field } }) => {
              return (
                <Field
                  {...field}
                  className={'tw-flex tw-flex-col tw-gap-0.5'}
                  onChange={e => onChange(parseInt(e.target.value, 10))}
                >
                  <Label>Number of Players</Label>
                  <NumberInput
                    data-testid={'game-number-of-players-input'}
                    slotProps={{
                      input: {
                        min: 0,
                      },
                    }}
                  />
                </Field>
              );
            }}
          />
          <Controller
            control={control}
            name={'genre'}
            render={({ field }) => {
              return (
                <Field {...field} className={'tw-flex tw-flex-col tw-gap-0.5'}>
                  <Label>Genre</Label>
                  <Select
                    data-testid={'game-genre-input'}
                    name={field.name}
                    slotProps={{
                      listbox: {
                        className: 'tw-w-30 tw-bg-white',
                        'data-testid': 'form-stories-select-options',
                      },
                      root: { className: 'tw-h-5 tw-w-30' },
                    }}
                    value={field.value}
                  >
                    <SelectOption
                      data-testid={'game-genre-input-fighting'}
                      value={'FIGHTING'}
                    >
                      Fighting
                    </SelectOption>
                    <SelectOption
                      data-testid={'game-genre-input-fps'}
                      value={'FPS'}
                    >
                      FPS
                    </SelectOption>
                    <SelectOption
                      data-testid={'game-genre-input-rpg'}
                      value={'RPG'}
                    >
                      RPG
                    </SelectOption>
                    <SelectOption
                      data-testid={'game-genre-input-srpg'}
                      value={'SRPG'}
                    >
                      SRPG
                    </SelectOption>
                    <SelectOption
                      data-testid={'game-genre-input-action'}
                      value={'ACTION'}
                    >
                      ACTION
                    </SelectOption>
                  </Select>
                </Field>
              );
            }}
          />
          <Controller
            control={control}
            defaultValue={new Date().toISOString().split('T')[0]}
            name={'releaseDate'}
            render={({ field }) => {
              return (
                <Field {...field} className={'tw-flex tw-flex-col tw-gap-0.5'}>
                  <Label>Release Date</Label>
                  <DateInput data-testid={'game-release-date-input'} />
                </Field>
              );
            }}
          />
          <footer className={'tw-mb-1 tw-mt-2 tw-flex tw-justify-end tw-gap-2'}>
            <Button data-testid={'game-submit'} type={'submit'}>
              Submit
            </Button>
            <Button
              data-testid={'cancel-game-submit'}
              onClick={e => {
                onModalClose?.(e, 'cancel');
              }}
            >
              Cancel
            </Button>
          </footer>
        </form>
      </ModalContent>
    </Modal>
  );
}
function isSubmitEvent(
  _e: unknown,
  reason: string,
): _e is CustomEvent<{ gameCreated: AddGameToLibraryFormValues }> {
  return reason === 'submit';
}

function AddGameToLibraryModalTrigger({
  onGameCreatedOnLibrary,
}: {
  onGameCreatedOnLibrary: (data: AddGameToLibraryFormValues) => Promise<void>;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const onModalClose = (e: Event, reason: 'submit' | 'cancel' | string) => {
    setModalOpen(false);
    if (isSubmitEvent(e, reason)) {
      onGameCreatedOnLibrary(e.detail.gameCreated);
    }
  };
  return (
    <>
      <Button
        data-testid={'add-game-to-library'}
        onClick={() => setModalOpen(true)}
      >
        Add Game to Library
      </Button>
      {modalOpen && (
        <AddGameToLibraryModal onModalClose={onModalClose} open={modalOpen} />
      )}
    </>
  );
}

export default AddGameToLibraryModalTrigger;
