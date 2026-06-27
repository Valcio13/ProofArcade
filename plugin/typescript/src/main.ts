import { StartPlugin, LoadConfig, initializeContract } from './contract/plugin.js';
import { Contract, ContractConfig, ContractAsync } from './contract/contract.js';
import { StartRPCServer } from './contract/rpc.js';

// Initialize the contract references to avoid circular dependencies
initializeContract(Contract, ContractConfig, ContractAsync);

// start the plugin with automatic config loading
async function main() {
    // DIAGNOSTIC: Log all CANOPY_PLUGIN_* environment variables
    console.log('=== PLUGIN STARTUP DIAGNOSTICS ===');
    console.log('All CANOPY_PLUGIN_* environment variables:');
    Object.keys(process.env)
        .filter(key => key.startsWith('CANOPY_PLUGIN_'))
        .forEach(key => {
            console.log(`  ${key} = ${process.env[key]}`);
        });
    console.log('Specific checks:');
    console.log(`  CANOPY_PLUGIN_NETWORK = ${process.env.CANOPY_PLUGIN_NETWORK}`);
    console.log(`  CANOPY_PLUGIN_DATA_DIR = ${process.env.CANOPY_PLUGIN_DATA_DIR}`);
    console.log(`  CANOPY_PLUGIN_ADDRESS = ${process.env.CANOPY_PLUGIN_ADDRESS}`);
    console.log(`  CANOPY_PLUGIN_CONFIG_PATH = ${process.env.CANOPY_PLUGIN_CONFIG_PATH}`);
    console.log('===================================');
    
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
