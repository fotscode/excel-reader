import User from '@domain/models/auth/User'
import roleRepo from './RoleRepo'

const findUserByUsername = async (username: string) => {
    return User.findOne({ username }).populate('role')
}

const createUser = async (username: string, password: string, role: string | null) => {
    if (role === null) {
        return new User({
            username,
            password,
        }).save()
    }
    return new User({
        username,
        password,
        role: await roleRepo.findRoleByName(role),
    }).save()
}

export default { findUserByUsername, createUser }
