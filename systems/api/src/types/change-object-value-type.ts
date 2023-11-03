export type ChangeObjectValueTypeToString<
  SourceType extends object,
  Keys extends keyof SourceType,
> = Omit<SourceType, Keys> & {
  [K in Keys]: string;
};
