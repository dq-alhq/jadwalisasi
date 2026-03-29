import type { User } from '#/generated/client'
import { Autocomplete, Popover, type SelectProps, useFilter } from 'react-aria-components'
import { Dialog } from '#/components/ui/dialog'
import { FieldError, Label } from '#/components/ui/field'
import { ListBox } from '#/components/ui/list-box'
import { SearchField, SearchInput } from '#/components/ui/search-field'
import { Select, SelectItem, SelectTrigger } from '#/components/ui/select'

export function SelectUser({ users, ...props }: SelectProps & { users: User[] }) {
    const { contains } = useFilter({ sensitivity: 'base' })
    return (
        <Select {...props}>
            <Label>Pilih User</Label>
            <SelectTrigger />
            <FieldError />
            <Popover className='entering:fade-in exiting:fade-out flex max-h-80 w-(--trigger-width) entering:animate-in exiting:animate-out flex-col overflow-hidden rounded-lg border bg-overlay'>
                <Dialog aria-label='User'>
                    <Autocomplete filter={contains}>
                        <div className='border-b bg-muted p-2'>
                            <SearchField autoFocus className='rounded-lg bg-bg'>
                                <SearchInput />
                            </SearchField>
                        </div>
                        <ListBox
                            className='max-h-[inherit] min-w-[inherit] rounded-t-none border-0 bg-transparent shadow-none'
                            items={users}
                        >
                            {(item) => <SelectItem id={`${item.id},${item.groupId}`}>{item.name}</SelectItem>}
                        </ListBox>
                    </Autocomplete>
                </Dialog>
            </Popover>
        </Select>
    )
}
