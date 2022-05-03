const uuid = require('uuid');
const prisma = require('./prisma');

module.exports = {
    checkUserExistsOrCreate: async () => {
        const count = await prisma.user.count();

        if (count === 0) {
            if (process.env.ADMIN_PASSWORD_HASH) {
                await prisma.user.create({
                    data: {
                        id: uuid.v4(),
                        username: 'admin',
                        password: process.env.ADMIN_PASSWORD_HASH
                    }
                });
            } else {
                throw Error('Not user is present and ADMIN_PASSWORD_HASH environment variable is missing.');
            }
        }
    },
}