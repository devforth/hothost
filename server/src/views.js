const uuid = require('uuid');
const express = require('express');

const prisma = require('./prisma');
const {
    sizeFormat,
    authorizeUser,
    mustBeAuthorizedView,
    mustNotBeAuthroizedView,
} = require('./utils');

const router = express.Router();
router.use(express.static('static'));

router.get('/', async (req, res) =>  {
    const monitoringData = await prisma.monitoringData.findMany({ orderBy: { createdAt: 'asc' } });
    res.locals.monitoringData = monitoringData.map(data => (data.createdAt.toISOString() === data.updatedAt.toISOString() ? { id: data.id, no_data: true } : {
        id: data.id,
        hostname: data.HOST_NAME,
        public_ip: data.HOST_PUBLIC_IP,
        os_name: data.HOST_OS_NAME,
        os_version: data.HOST_OS_VERSION === "unknown" ? data.SYSTEM_KERNEL_VERSION : data.HOST_OS_VERSION,
        cpu_name: `${data.SYSTEM_CPU_MODEL}`,
        cpu_count: data.SYSTEM_CPU_LOGICAL_CPU_COUNT,
        ram_total: sizeFormat(data.SYSTEM_TOTAL_RAM),
        ram_used: (((+data.SYSTEM_TOTAL_RAM - +data.SYSTEM_FREE_RAM) / +data.SYSTEM_TOTAL_RAM) * 100).toFixed(0),
        swap_total: sizeFormat(data.SYSTEM_TOTAL_SWAP),
        swap_used: (((+data.SYSTEM_TOTAL_SWAP - +data.SYSTEM_FREE_SWAP) / +data.SYSTEM_TOTAL_SWAP) * 100).toFixed(0),
        disk_total: sizeFormat(+data.DISK_AVAIL + +data.DISK_USED),
        disk_used: ((+data.DISK_USED / (+data.DISK_USED + +data.DISK_AVAIL)) * 100).toFixed(0),
        disk_warning: ((+data.DISK_USED / (+data.DISK_USED + +data.DISK_AVAIL)) * 100) > 80,
    }));
    console.log(res.locals.monitoringData);
    res.render('home');
});

router.get('/login/', mustNotBeAuthroizedView((req, res) => res.render('login')));
router.post('/login/', mustNotBeAuthroizedView(async (req, res) => {
    try {
        const { username, password } = req.fields;
        if (username && password) {
            const jwtToken = await authorizeUser(username, password);
            res.cookie('__hhjwt', jwtToken, { maxAge: 60 * 60 * 1000 });
            res.redirect(req.query.next || '/');
        }
    } catch (e) {
        res.locals.error = e.message;
        res.render('login');
    }
}));

router.get('/users/', mustBeAuthorizedView((req, res) => res.render('users')));
router.post('/users/', mustBeAuthorizedView((req, res) => {

}));
module.exports = router;