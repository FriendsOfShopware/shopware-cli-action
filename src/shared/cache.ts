export function getCacheKeys() {
    const restoreKey = `shopware-cli-cache-${process.env.SHOPWARE_CLI_VERSION}`
    return [
        restoreKey
    ]
}