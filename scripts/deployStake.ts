import { Address, Cell, address, toNano } from '@ton/core';
import { Stake } from '../wrappers/Stake';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const stake = provider.open(
        Stake.createFromConfig(
            {
                lock_time: 1800,
                not_addr: address('UQDtU7yZnlpK9po_nD3lN299kMSH4VKPMx5xbb6FkD1REpyy'),
                not_bytecode: Cell.fromBase64(
                    'te6ccgEBAQEAcQAA3v8AIN0gggFMl7ohggEznLqxn3Gw7UTQ0x/THzHXC//jBOCk8mCDCNcYINMf0x/TH/gjE7vyY+1E0NMf0x/T/9FRMrryoVFEuvKiBPkBVBBV+RDyo/gAkyDXSpbTB9QC+wDo0QGkyMsfyx/L/8ntVA==',
                ),
                admin_addr: address('UQAIehKxdz_4OjYcXyN7X_i6CsKZGF3SsikO_VqS9wikEmA4'),
            },
            await compile('Stake'),
        ),
    );

    await stake.sendDeploy(provider.sender(), toNano('0.05'));
    await provider.waitForDeploy(stake.address);
}
