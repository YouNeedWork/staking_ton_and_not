import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    fromNano,
    Sender,
    SendMode,
} from '@ton/core';

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
    deposit_ton: 0xb0490e98,
    withdarw_ton: 0x865835b0,
    withdarw_not: 0x6a8bea6c,
};

//const error::not_staked = 700;
//const error::not_enough = 701;
//const error::jetton_sender = 109;
//const error::fund = 103;
//const error::not_admin = 702;
//const error::locked = 703;

export const ERRORS = {
    not_staked: 700,
    not_enough: 701,
    jetton_sender: 109,
    fund: 103,
    not_admin: 702,
    locked: 703,
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

    async sendStakeTON(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryID?: number;
        },
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.deposit_ton, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .endCell(),
        });
    }

    async sendWithdrawTON(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryID?: number;
            amount: bigint;
        },
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.withdarw_ton, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeCoins(opts.amount)
                .endCell(),
        });
    }

    async sendWithdrawNot(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryID?: number;
            amount: bigint;
            creed_id?: number;
        },
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.withdarw_not, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeCoins(opts.amount)
                .endCell(),
        });
    }

    async getUserState(provider: ContractProvider, address: Address) {
        const result = await provider.get('get_user_state', [
            { type: 'slice', cell: beginCell().storeAddress(address).endCell() },
        ]);
        const tuple = result.stack.readTuple();
        let res = [];
            const temp = tuple.pop();
            if (temp.type == 'int') {
                res.push(fromNano(temp.value));
            }

        console.log(res);
        return res;
    }
}
