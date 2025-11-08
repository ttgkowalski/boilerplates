import type {
    ColumnType,
    Generated,
    Insertable,
    Selectable,
    Updateable,
} from 'kysely'

export interface RoleTable {
    id: Generated<string>
    name: string
    description: string | null
    created_at: ColumnType<Date, Date | undefined, never>
}

export type Role = Selectable<RoleTable>
export type NewRole = Insertable<RoleTable>
export type RoleUpdate = Updateable<RoleTable>

