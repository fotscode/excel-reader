import Permission from '@domain/models/auth/Permission'
import Role from '@domain/models/auth/Role'

const findRoleByName = async (name: string) => {
    return Role.findOne({ name })
}

const createRole = async (name: string, permissions: Permission[]) => {
    return new Role({
        name,
        permissions,
    }).save()
}

export default { findRoleByName, createRole }
