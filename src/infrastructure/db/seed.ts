import Permission from '@domain/models/auth/Permission'
import roleRepo from '@infrastructure/repositories/RoleRepo'
import userRepo from '@infrastructure/repositories/UserRepo'

const createRoles = async () => {
    if (await roleRepo.findRoleByName('admin')) {
        console.debug('Roles already created')
        return
    }
    await roleRepo.createRole('admin', [Permission.UPLOAD, Permission.REQUEST])
    await roleRepo.createRole('watcher', [Permission.REQUEST])
    console.debug('Roles created')
}

const createUsers = async () => {
    if (await userRepo.findUserByUsername('admin')) {
        console.debug('Users already created')
        return
    }
    await userRepo.createUser('admin', 'admin', 'admin')
    await userRepo.createUser('watcher', 'watcher', 'watcher')
    await userRepo.createUser('empty', 'empty', null)
    console.debug('Users created')
}

const seed = async () => {
    console.debug('Creating roles and users...')
    await createRoles()
    await createUsers()
}

export default seed
