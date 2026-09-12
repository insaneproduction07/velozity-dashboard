import { getClients, createClient } from './service.js';
export async function getClientsController(req, res, next) {
    try {
        const clients = await getClients();
        res.json({ success: true, data: clients });
    }
    catch (error) {
        next(error);
    }
}
export async function createClientController(req, res, next) {
    try {
        const authReq = req;
        const client = await createClient(req.body);
        res.status(201).json({ success: true, data: client });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=controller.js.map