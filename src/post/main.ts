import globalCacheDir from 'global-cache-dir'
import { saveCache, isFeatureAvailable } from '@actions/cache';
import { existsSync } from 'fs';
import { getCacheKeys } from '../shared/cache';

async function run() {
    if (isFeatureAvailable()) {
        const cacheKeys = getCacheKeys();
        const shopwareCliCacheDir = await globalCacheDir('shopware-cli');

        if (existsSync(shopwareCliCacheDir)) {
            await saveCache(
                [
                    shopwareCliCacheDir
                ],
                cacheKeys.shift() as string,
                undefined,
                false
            )
        }
    }
 
    process.exit(0);
}

run();