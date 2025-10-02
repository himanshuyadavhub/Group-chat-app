const { Messages, ArchiveMessages } = require("../model/Associations");
const { Op } = require('sequelize');
const sequelize = require("../utils/db-connection");


async function transferArchiveChat() {
    const transaction = await sequelize.transaction();

    try {
        const backupBoundary = new Date(Date.now() - 1 * 60 * 60 * 1000);

        const messages = await Messages.findAll(
            {
                where: {
                    createdAt: {
                        [Op.lt]: backupBoundary
                    }
                }
            },
            { transaction }
        );
        if (!messages.length) {
            return { archived: 0, deleted: 0 }
        }
        const preArchivedMessages = messages.map(msg => msg.toJSON());

        const archiveMessages = await ArchiveMessages.bulkCreate(preArchivedMessages, { transaction });
        if (archiveMessages.length) {
            const deletedMessages = await Messages.destroy(
                {
                    where: {
                        createdAt: {
                            [Op.lt]: backupBoundary
                        }
                    }
                },
                { transaction }
            )
            await transaction.commit();
            return { archived: archiveMessages.length, deleted: deletedMessages }
        } else {
            await transaction.rollback();
        }
    } catch (error) {
        console.log("Error: transferArchiveChat --- ", error.message);
        await transaction.rollback();
    }
}

module.exports = {
    transferArchiveChat
}