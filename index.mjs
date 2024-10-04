// index.mjs
import { createServer } from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import Blockchain from './blockchain.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const myBlockchain = new Blockchain();

// Función para parsear el cuerpo de la solicitud
async function parseBody(req) {
    const buffers = [];
    for await (const chunk of req) {
        buffers.push(chunk);
    }
    return Buffer.concat(buffers).toString();
}

const server = createServer(async (req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        const filepath = path.join(__dirname, 'index.html');
        fs.readFile(filepath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.write('404 Not Found');
                res.end();
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(data);
                res.end();
            }
        });
    }

    // Ruta para agregar bloque desde licorera
    else if (req.url === '/addBlockLicorera' && req.method === 'POST') {
        const body = await parseBody(req);
        const { index, licoreraInfo } = JSON.parse(body);

        // Validar datos
        if (!index || !licoreraInfo || !licoreraInfo.name || !licoreraInfo.timestamp) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Faltan datos requeridos: índice o información de la licorera.' }));
            return;
        }

        try {
            myBlockchain.addBlockByRole(parseInt(index), 'Licorera', { name: licoreraInfo.name, timestamp: licoreraInfo.timestamp });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Licorera registrada en blockchain', blockchain: myBlockchain.chain }));
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }

    // Ruta para agregar bloque desde distribuidor
    else if (req.url === '/addBlockDistribuidor' && req.method === 'POST') {
        const body = await parseBody(req);
        const { index, distribuidorInfo } = JSON.parse(body);

        // Validar datos
        if (!index || !distribuidorInfo || !distribuidorInfo.name || !distribuidorInfo.timestamp) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Faltan datos requeridos: índice o información del distribuidor.' }));
            return;
        }

        try {
            myBlockchain.addBlockByRole(parseInt(index), 'Distribuidor', { name: distribuidorInfo.name, timestamp: distribuidorInfo.timestamp });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Distribuidor registrado en blockchain', blockchain: myBlockchain.chain }));
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }

    // Ruta para agregar bloque desde comerciante
    else if (req.url === '/addBlockComerciante' && req.method === 'POST') {
        const body = await parseBody(req);
        const { index, comercianteInfo } = JSON.parse(body);

        // Validar datos
        if (!index || !comercianteInfo || !comercianteInfo.name || !comercianteInfo.timestamp) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Faltan datos requeridos: índice o información del comerciante.' }));
            return;
        }

        try {
            myBlockchain.addBlockByRole(parseInt(index), 'Comerciante', { name: comercianteInfo.name, timestamp: comercianteInfo.timestamp });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Comerciante registrado en blockchain', blockchain: myBlockchain.chain }));
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }

    // Ruta para obtener bloques por índice
    else if (req.url.startsWith('/getBlocksByIndex/') && req.method === 'GET') {
        const index = req.url.split('/').pop();
        console.log(`Buscando bloques por índice: ${index}`);
        const blocks = myBlockchain.getBlocksByIndex(index);
        console.log(`Bloques encontrados: ${blocks}`);
        if (blocks.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `No se han registrado bloques con el índice ${index}` }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ blocks }));
        }
    }

    // Ruta para marcar un bloque como vendido
    else if (req.url.startsWith('/markAsSold/') && req.method === 'PUT') {
        const index = req.url.split('/').pop();
        try {
            myBlockchain.markBlockAsSold(parseInt(index));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Bloque marcado como vendido' }));
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }

    // Si no coincide ninguna ruta
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.write('404 Not Found');
        res.end();
    }
});

// Iniciamos el servidor en el puerto 3000
server.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
