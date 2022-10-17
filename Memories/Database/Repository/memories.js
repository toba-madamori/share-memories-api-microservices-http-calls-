/* eslint-disable camelcase */
const MemoryModel = require('../Models/memories')
const { NotFoundError } = require('../../Errors')

// Dealing with data base operations
class MemoryRepository {
    async createMemory ({ userid, memory, title, tags, cloudinary_id }) {
        const mem = new MemoryModel({
            userid,
            memory,
            title,
            tags,
            cloudinary_id
        })

        const newMemory = await mem.save()
        return newMemory
    }

    async findMemory ({ _id }) {
        const memory = await MemoryModel.findById(_id)

        if (!memory) throw new NotFoundError('sorry, this memory does not exist')

        return memory
    }

    async findAll ({ userid }) {
        const memories = await MemoryModel.find({ userid }).select('-createdAt -updatedAt -__v')

        return memories
    }
}

module.exports = MemoryRepository
