// blockchain.js
const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(index, role, data, previousHash = '') {
        this.index = index;
        this.role = role; // Nuevo campo para el rol
        this.timestamp = new Date();
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.createHash();
        this.nonce = 0;
    }

    createHash() {
        return SHA256(this.index + this.role + this.timestamp + JSON.stringify(this.data) + this.previousHash + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while (!this.hash.startsWith(difficulty)) {
            this.nonce++;
            this.hash = this.createHash();
        }
    }
}

class Blockchain {
    constructor(difficulty = '00') {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = difficulty;
        this.roleOrder = ['Licorera', 'Distribuidor', 'Comerciante'];
    }

    createGenesisBlock() {
        return new Block(0, 'Genesis Block', { role: 'Genesis Block', sold: false }, '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    getBlocksByIndex(index) {
        return this.chain.filter(block => block.index == index);
    }

    getLatestBlockByIndex(index) {
        const blocks = this.getBlocksByIndex(index);
        if (blocks.length === 0) return null;
        // Ordenar los bloques según el orden de roles
        blocks.sort((a, b) => this.roleOrder.indexOf(a.role) - this.roleOrder.indexOf(b.role));
        return blocks[blocks.length - 1];
    }

    addBlock(newBlock) {
        const latestBlock = this.getLatestBlock();
        newBlock.previousHash = latestBlock.hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    addBlockByRole(index, role, info) {
        // Validar el orden de roles
        const blocks = this.getBlocksByIndex(index);
        const latestBlock = this.getLatestBlockByIndex(index);

        // Si es el primer registro (Licorera)
        if (role === 'Licorera') {
            if (blocks.length > 0) {
                throw new Error('El índice ya ha sido registrado por la Licorera.');
            }
        } else {
            const expectedRoleIndex = this.roleOrder.indexOf(role);
            if (expectedRoleIndex === -1) {
                throw new Error('Rol no válido.');
            }
            if (latestBlock && this.roleOrder.indexOf(latestBlock.role) + 1 !== expectedRoleIndex) {
                throw new Error(`Debe registrar como ${this.roleOrder[expectedRoleIndex - 1]} antes de ${role}.`);
            }
        }

        // Verificar si ya está vendido
        if (latestBlock && latestBlock.data.sold) {
            throw new Error('Este índice ya ha sido vendido y no puede ser registrado nuevamente.');
        }

        const newBlock = new Block(index, role, { ...info, sold: false }, latestBlock ? latestBlock.hash : '0');
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    markBlockAsSold(index) {
        const latestBlock = this.getLatestBlockByIndex(index);
        if (!latestBlock) {
            throw new Error('No se encontró ningún bloque para este índice.');
        }
        latestBlock.data.sold = true;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.createHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

module.exports = Blockchain;
