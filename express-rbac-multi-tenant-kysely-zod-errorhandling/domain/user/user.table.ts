import type {
    ColumnType,
    Generated,
    Insertable,
    Selectable,
    Updateable,
} from 'kysely'

export interface UserTable {
    id: Generated<string>
    tenant_id: string | null // affiliate_id
    email: string
    password_hash: string
    created_at: ColumnType<Date, Date | undefined, never>
}

export type User = Selectable<UserTable>
export type NewUser = Insertable<UserTable>
export type UserUpdate = Updateable<UserTable>
