import { EnvelopeIcon } from '@heroicons/react/24/outline'
import { CalendarDate, CalendarDateTime, parseDate, parseDateTime } from '@internationalized/date'
import type { ReactNode } from 'react'
import { type FormProps, Form as RACForm } from 'react-aria-components'
import { twMerge } from 'tailwind-merge'
import { Button } from '#/components/ui/button'
import { Checkbox, CheckboxLabel } from '#/components/ui/checkbox'
import { DatePicker, DatePickerTrigger } from '#/components/ui/date-picker'
import { FieldError, Label } from '#/components/ui/field'
import { Input, InputGroup, InputPassword } from '#/components/ui/input'
import { Loader } from '#/components/ui/loader'
import { NumberField, NumberInput } from '#/components/ui/number-field'
import { Radio, RadioGroup } from '#/components/ui/radio'
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger } from './ui/select'
import { TextField } from './ui/text-field'
import { Textarea } from './ui/textarea'

export const Form = (props: FormProps) => <RACForm {...props} />

interface FieldProps {
    name: string
    label: string
    placeholder?: string
    autoFocus?: boolean
    defaultValue?: string
}

export const FormText = ({ name, label, placeholder, autoFocus, defaultValue }: FieldProps) => (
    <TextField autoFocus={autoFocus} defaultValue={defaultValue} name={name} type={'text'}>
        <Label>{label}</Label>
        <Input placeholder={placeholder} />
        <FieldError />
    </TextField>
)

interface FieldProps {
    name: string
    label: string
    placeholder?: string
    autoFocus?: boolean
    defaultValue?: string
}

export const FormEmail = ({ name, label, placeholder, autoFocus, defaultValue }: FieldProps) => (
    <TextField autoFocus={autoFocus} defaultValue={defaultValue} name={name} type={'email'}>
        <Label>{label}</Label>
        <InputGroup>
            <EnvelopeIcon />
            <Input placeholder={placeholder} />
        </InputGroup>
        <FieldError />
    </TextField>
)

export const FormPassword = ({ name, label, placeholder, autoFocus, defaultValue }: FieldProps) => (
    <TextField autoFocus={autoFocus} defaultValue={defaultValue} name={name} type={'password'}>
        <Label>{label}</Label>
        <InputPassword placeholder={placeholder} />
        <FieldError />
    </TextField>
)

interface FieldNumberProps extends Omit<FieldProps, 'defaultValue'> {
    defaultValue?: number
}

export const FormNumber = ({ name, label, placeholder, autoFocus, defaultValue }: FieldNumberProps) => (
    <NumberField autoFocus={autoFocus} defaultValue={defaultValue} name={name}>
        <Label>{label}</Label>
        <NumberInput placeholder={placeholder} />
        <FieldError />
    </NumberField>
)

export const FormTextarea = ({ name, label, placeholder, autoFocus, defaultValue }: FieldProps) => (
    <TextField autoFocus={autoFocus} defaultValue={defaultValue} name={name}>
        <Label>{label}</Label>
        <Textarea placeholder={placeholder} />
        <FieldError />
    </TextField>
)

export interface FieldSelectProps extends FieldProps {
    items: Array<{ id: string | number; label: string }>
}

export const FormSelect = ({ name, label, placeholder, autoFocus, items, defaultValue }: FieldSelectProps) => (
    <Select autoFocus={autoFocus} defaultValue={defaultValue} name={name} placeholder={placeholder}>
        <Label>{label}</Label>
        <SelectTrigger />
        <FieldError />
        <SelectContent items={items}>
            {(item) => (
                <SelectItem id={item.id} textValue={item.label}>
                    <SelectLabel>{item.label}</SelectLabel>
                </SelectItem>
            )}
        </SelectContent>
    </Select>
)

interface FieldCheckboxProps extends Omit<FieldProps, 'placeholder' | 'defaultValue'> {
    defaultValue?: boolean
}

export const FormCheckbox = ({ name, label, autoFocus, defaultValue }: FieldCheckboxProps) => (
    <Checkbox autoFocus={autoFocus} defaultSelected={defaultValue} name={name}>
        <CheckboxLabel>{label}</CheckboxLabel>
        <FieldError />
    </Checkbox>
)

interface FieldRadioProps extends Omit<FieldProps, 'placeholder' | 'autoFocus'> {
    items: Array<{ value: string; label: string }>
    orientation?: 'horizontal' | 'vertical'
}

export const FormRadio = ({ name, label, defaultValue, items, orientation = 'horizontal' }: FieldRadioProps) => (
    <RadioGroup defaultValue={defaultValue} name={name} orientation={orientation}>
        <Label>{label}</Label>
        <div className={twMerge('flex', orientation === 'horizontal' ? 'flex-row gap-3' : 'flex-col gap-2')}>
            {items.map((item) => (
                <Radio key={item.value} value={item.value}>
                    <Label className='whitespace-nowrap'>{item.label}</Label>
                </Radio>
            ))}
        </div>
    </RadioGroup>
)

interface FieldDateProps extends Omit<FieldProps, 'placeholder' | 'defaultValue'> {
    defaultValue?: string | null
}

export const FormDate = ({ name, label, defaultValue }: FieldDateProps) => (
    <DatePicker
        defaultValue={
            defaultValue
                ? parseDate(defaultValue)
                : new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())
        }
        name={name}
        placeholderValue={new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())}
    >
        <Label>{label}</Label>
        <DatePickerTrigger />
        <FieldError />
    </DatePicker>
)

export const FormDateTime = ({ name, label, defaultValue }: FieldDateProps) => (
    <DatePicker
        defaultValue={
            defaultValue
                ? parseDateTime(defaultValue)
                : new CalendarDateTime(
                      new Date().getFullYear(),
                      new Date().getMonth() + 1,
                      new Date().getDate(),
                      new Date().getHours(),
                      new Date().getMinutes(),
                      new Date().getSeconds()
                  )
        }
        hideTimeZone
        hourCycle={24}
        name={name}
        placeholderValue={
            new CalendarDateTime(
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                new Date().getDate(),
                new Date().getHours(),
                new Date().getMinutes(),
                new Date().getSeconds()
            )
        }
    >
        <Label>{label}</Label>
        <DatePickerTrigger />
        <FieldError />
    </DatePicker>
)

export const SubmitButton = ({
    label = 'Simpan',
    isPending,
    icon
}: {
    label?: string
    isPending?: boolean
    icon?: ReactNode
}) => (
    <Button isPending={isPending} type='submit'>
        {isPending ? (
            <Loader />
        ) : (
            (icon ?? (
                <svg
                    aria-hidden='true'
                    className='intentui-icons size-4'
                    data-slot='icon'
                    fill='none'
                    height='16'
                    viewBox='0 0 24 24'
                    width='16'
                    xmlns='http://www.w3.org/2000/svg'
                >
                    <path
                        d='M7.75 3.75v3.5a1 1 0 0 0 1 1h6.5a1 1 0 0 0 1-1v-3.5m4 3.414V19.25a1 1 0 0 1-1 1H4.75a1 1 0 0 1-1-1V4.75a1 1 0 0 1 1-1h12.086a1 1 0 0 1 .707.293l2.414 2.414a1 1 0 0 1 .293.707M7.75 13.75v5.5a1 1 0 0 0 1 1h6.5a1 1 0 0 0 1-1v-5.5a1 1 0 0 0-1-1h-6.5a1 1 0 0 0-1 1'
                        stroke='currentColor'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='1.5'
                    />
                </svg>
            ))
        )}
        {label}
    </Button>
)

Form.Text = FormText
Form.Password = FormPassword
Form.Email = FormEmail
Form.Textarea = FormTextarea
Form.Number = FormNumber
Form.Select = FormSelect
Form.Checkbox = FormCheckbox
Form.Radio = FormRadio
Form.Date = FormDate
Form.DateTime = FormDateTime
Form.Button = SubmitButton

export default Form
