/* eslint-disable camelcase */
const MemoryService = require('../../Services/memories')
const { StatusCodes } = require('http-status-codes')
const { newMemorySchema, idSchema, updateMemorySchema } = require('../../Utils/validators')
const { publishReactionEvent } = require('../../Utils/events')
const validator = require('express-joi-validation').createValidator({})
const upload = require('../../Utils/multer')
const authMiddleware = require('../Middleware/authentication')

module.exports = (app) => {
    const service = new MemoryService()

    app.post('/new', authMiddleware, upload.single('memory'), validator.body(newMemorySchema), async (req, res) => {
        const { title, tags } = req.body
        const image = req.file
        const { userID: userid } = req.user

        const memory = await service.createMemory({ userid, title, tags, image })
        res.status(StatusCodes.CREATED).json({ status: 'success', memory })
    })

    app.get('/all', authMiddleware, async (req, res) => {
        const { userID: userid } = req.user
        const memories = await service.getAllMemories({ userid })

        res.status(StatusCodes.OK).json({ status: 'success', memories, nbhits: memories.length })
    })

    app.get('/:id', authMiddleware, validator.params(idSchema), async (req, res) => {
        const { id: memoryid } = req.params

        const memory = await service.getMemory({ memoryid })
        // call to reactions-service for memory-comments
        const response = await publishReactionEvent({ event: 'GET_COMMENTS', data: { memoryid } })

        res.status(StatusCodes.OK).json({ status: 'success', memory, comments: response.data.data })
    })

    app.patch('/update/:id', authMiddleware, upload.single('memory'), validator.params(idSchema), validator.body(updateMemorySchema), async (req, res) => {
        const { title, tags } = req.body
        const { id: memoryid } = req.params
        const image = req.file
        const { userID: userid } = req.user

        const memory = await service.updateMemory({ userid, title, tags, image, memoryid })
        res.status(StatusCodes.OK).json({ status: 'success', memory })
    })

    app.get('/whoami', (req, res, next) => {
        return res.status(StatusCodes.OK).json({ msg: '/memory : I am Memory Service' })
    })
}
