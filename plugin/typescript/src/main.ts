import { StartPlugin, LoadConfig, initializeContract } from './contract/plugin.js';
import { Contract, ContractConfig, ContractAsync } from './contract/contract.js';
import { StartRPCServer } from './contract/rpc.js';

// Initialize the contract references to avoid circular dependencies
initializeContract(Contract, ContractConfig, ContractAsync);

// start the plugin with automatic config loading
async function main() {
    const config = await LoadConfig();
    console.log(`Starting plugin with ChainId: ${config.ChainId}`);
    const plugin = StartPlugin(config);
    
    // start the plugin's own HTTP server exposing custom, chain-specific RPC endpoints
    StartRPCServer(plugin);
}

main().catch((err) => {
    console.error('Failed to start plugin:', err);
    process.exit(1);
});

// create a cancellable context that listens for kill signals
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
