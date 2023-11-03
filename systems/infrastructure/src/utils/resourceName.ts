import * as pulumi from '@pulumi/pulumi';
import kebabcase from 'lodash.kebabcase';

export function resourceName(
  strings: TemplateStringsArray,
  ...values: unknown[]
) {
  return kebabcase(
    `${pulumi.getProject()}-${pulumi.getStack()}-${strings
      .map((str, i) => {
        const hasValue = values[i] !== undefined;
        if (hasValue) {
          return [str, values[i]];
        }
        return str;
      })
      .flat()
      .join('')}`,
  );
}
