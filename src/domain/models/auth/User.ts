import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { IRole } from './Role'
import { defaultSaltValue } from '@shared/config'

interface IUser extends mongoose.Document {
    username: string
    password: string
    role: IRole
    comparePassword: (password: string) => Promise<boolean>
}

const userSchema = new mongoose.Schema<IUser>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
})

userSchema.pre<IUser>('save', async function (next) {
    if (this.isModified('password')) {
        try {
            const salt = await bcrypt.genSalt(defaultSaltValue)
            const hashedPassword = await bcrypt.hash(this.password, salt)
            this.password = hashedPassword
        } catch (error) {
            console.error(`Error hashing password for user ${this.username}: ${error}`)
        }
    }
    next()
})

userSchema.methods.comparePassword = async function (password: string) {
    return bcrypt.compare(password, this.password)
}

const User = mongoose.model('User', userSchema)

export { IUser }
export default User
