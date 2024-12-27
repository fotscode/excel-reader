interface IMongooseType {
    type: any
    set?: (value: any) => any
    required?: boolean
}

export { IMongooseType }
