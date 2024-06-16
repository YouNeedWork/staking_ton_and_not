import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type StakeConfig = {
    lock_time: number;
    not_addr: Address;
    not_bytecode: Cell;
    admin_addr: Address;
};

export function stakeConfigToCell(config: StakeConfig): Cell {
    return beginCell()
        .storeUint(config.lock_time, 32)
        .storeRef(beginCell().storeAddress(config.not_addr).storeRef(config.not_bytecode).endCell())
        .storeRef(beginCell().storeAddress(config.admin_addr).endCell())
        .storeDict(null)
        .storeDict(null)
        .endCell();
}

export const Opcodes = {
    increase: 0x7e8764ef,
};

export class Stake implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new Stake(address);
    }

    static createFromConfig(config: StakeConfig, code: Cell, workchain = 0) {
        const data = stakeConfigToCell(config);
        const init = { code, data };
        return new Stake(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
