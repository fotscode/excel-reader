import mongoose from 'mongoose'

interface IRole extends mongoose.Document {
    name: string
    permissions: string[]
}

const roleSchema = new mongoose.Schema<IRole>({
    name: { type: String, required: true, unique: true },
    permissions: [String],
})

const Role = mongoose.model('Role', roleSchema)

export { IRole }
export default Role
