import type {
    ColumnType,
    Generated,
    Insertable,
    Selectable,
    Updateable,
} from 'kysely'

export interface TenantTable {
    id: Generated<string>
    name: string
    created_at: ColumnType<Date, Date | undefined, never>
}

export type Tenant = Selectable<TenantTable>
export type NewTenant = Insertable<TenantTable>
export type TenantUpdate = Updateable<TenantTable>
