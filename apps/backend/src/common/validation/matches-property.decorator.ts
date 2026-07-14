import type { ValidationArguments, ValidationOptions } from 'class-validator';
import { registerDecorator } from 'class-validator';

/** Valida que el campo decorado sea idéntico al valor del campo `property` indicado. */
export function MatchesProperty(property: string, validationOptions?: ValidationOptions): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'matchesProperty',
      target: object.constructor,
      propertyName: propertyName.toString(),
      ...(validationOptions === undefined ? {} : { options: validationOptions }),
      constraints: [property],
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const [relatedPropertyName] = args.constraints as [string];
          const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments): string {
          const [relatedPropertyName] = args.constraints as [string];
          return `${args.property} debe coincidir con ${relatedPropertyName}.`;
        },
      },
    });
  };
}
