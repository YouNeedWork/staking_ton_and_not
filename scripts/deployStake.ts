import { toNano } from '@ton/core';
import { Stake } from '../wrappers/Stake';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const stake = provider.open(
        Stake.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('Stake')
        )
    );

    await stake.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(stake.address);

    console.log('ID', await stake.getID());
}
