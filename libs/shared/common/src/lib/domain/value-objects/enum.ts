import { Literal, Union } from 'runtypes';

export const prepareEnumRuntype = (enumObject: Record<string, string>) => {
  const [firstValue, ...otherValues] = Object.keys(enumObject).map((key) =>
    Literal(enumObject[key])
  );
  return Union(firstValue, ...otherValues);
};
