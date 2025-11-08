import type {
    ColumnType,
    Generated,
    Insertable,
    Selectable,
    Updateable,
} from 'kysely'

export interface UserRoleTable {
    id: Generated<string>
    user_id: string
    role_id: string
    created_at: ColumnType<Date, Date | undefined, never>
}

export type UserRole = Selectable<UserRoleTable>
export type NewUserRole = Insertable<UserRoleTable>
export type UserRoleUpdate = Updateable<UserRoleTable>

