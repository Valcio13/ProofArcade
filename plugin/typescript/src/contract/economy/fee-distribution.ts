/**
 * Economy v2 - Fee Distribution
 * 
 * Handles entry fee splitting and distribution across treasury buckets.
 * Supports Daily Challenge, Classic Mode, and future game modes.
 */

import Long from 'long';
import {
    FeeSplitConfig,
    FeeSplitResult,
    EconomyError,
    EconomyErrorCodes,
} from './types.js';
import { calculateBpsAmount } from '../utils/helpers.js';
import {
    getConfiguredDailyPlatformFeeBps,
    getConfiguredDailyRewardFeeBps,
    getConfiguredDailyReserveFeeBps,
    getConfiguredDailyShopFeeBps,
    getConfiguredClassicPlatformFeeBps,
} from '../config/index.js';

/**
 * Validates that fee split configuration totals 100%
 * @param config Fee split configuration
 * @throws EconomyError if total is not 10000 bps
 */
export function validateFeeSplit(config: FeeSplitConfig): void {
    const total = config.platformBps + 
                  config.rewardBps + 
                  config.reserveBps + 
                  config.shopBps + 
                  (config.monthlyBps ?? 0);
    
    if (total !== 10000) {
        throw new EconomyError(
            `Fee split must total 100% (10000 bps), got ${total} bps`,
            EconomyErrorCodes.INVALID_FEE_SPLIT
        );
    }
}

/**
 * Splits an entry fee according to the provided configuration
 * Uses integer division with remainder assignment to ensure exact totals
 * 
 * @param fee Total entry fee amount
 * @param config Fee split configuration (in basis points)
 * @returns Computed split amounts
 * 
 * @example
 * ```typescript
 * // Daily Challenge: 80% reward, 10% reserve, 5% shop, 5% platform
 * const dailySplit = splitFee(fee, DefaultFeeSplits.daily);
 * 
 * // Classic Mode: 45% shop, 30% monthly, 20% reserve, 5% platform
 * const classicSplit = splitFee(fee, DefaultFeeSplits.classic);
 * ```
 */
export function splitFee(fee: Long, config: FeeSplitConfig): FeeSplitResult {
    // Validate configuration
    validateFeeSplit(config);
    
    // Convert fee to number for calculation (should be safe for game fees)
    const feeNum = fee.toNumber();
    
    // Calculate each portion using integer division
    const platform = Math.floor((feeNum * config.platformBps) / 10000);
    const reward = Math.floor((feeNum * config.rewardBps) / 10000);
    const reserve = Math.floor((feeNum * config.reserveBps) / 10000);
    const shop = Math.floor((feeNum * config.shopBps) / 10000);
    const monthly = config.monthlyBps 
        ? Math.floor((feeNum * config.monthlyBps) / 10000)
        : 0;
    
    // Calculate remainder and assign to last bucket
    const calculated = platform + reward + reserve + shop + monthly;
    const remainder = feeNum - calculated;
    
    // Assign remainder to shop bucket (last in classic), or reward (last in daily)
    let adjustedShop = shop;
    let adjustedReward = reward;
    
    if (config.monthlyBps) {
        // Classic mode: remainder goes to shop
        adjustedShop += remainder;
    } else {
        // Daily mode: remainder goes to reward
        adjustedReward += remainder;
    }
    
    const result: FeeSplitResult = {
        platform: Long.fromNumber(platform),
        reward: Long.fromNumber(adjustedReward),
        reserve: Long.fromNumber(reserve),
        shop: Long.fromNumber(adjustedShop),
    };
    
    if (config.monthlyBps) {
        result.monthly = Long.fromNumber(monthly);
    }
    
    return result;
}

/**
 * Split daily challenge entry fee into treasury buckets
 * 
 * Uses configuration to determine the split percentages and ensures
 * the total matches the input amount through remainder assignment.
 * 
 * @param amount - Total fee amount to split
 * @param cfg - Game configuration with fee BPS values
 * @returns Split amounts: platform, daily (reward pool), reserve, shop
 * 
 * @remarks
 * - Default split: 80% daily reward, 10% reserve, 5% shop, 5% platform
 * - If BPS don't sum to 10000, remainder goes to shop bucket
 * - Uses calculateBpsAmount for each calculation
 */
export function splitDailyFee(amount: Long, cfg: any): { platform: Long; daily: Long; reserve: Long; shop: Long } {
    const platformBps = getConfiguredDailyPlatformFeeBps(cfg);
    const dailyBps = getConfiguredDailyRewardFeeBps(cfg);
    const reserveBps = getConfiguredDailyReserveFeeBps(cfg);
    const shopBps = getConfiguredDailyShopFeeBps(cfg);
    
    const platform = calculateBpsAmount(amount, platformBps);
    const daily = calculateBpsAmount(amount, dailyBps);
    const reserve = calculateBpsAmount(amount, reserveBps);
    
    // If BPS sum to exactly 10000, calculate shop; otherwise assign remainder
    const shop = platformBps + dailyBps + reserveBps + shopBps === 10000
        ? calculateBpsAmount(amount, shopBps)
        : amount.subtract(platform).subtract(daily).subtract(reserve);
    
    return { platform, daily, reserve, shop };
}

/**
 * Split classic mode entry fee into treasury buckets
 * 
 * Classic mode adds a monthly competition pool (30%) and adjusts
 * reserve and shop percentages accordingly.
 * 
 * @param amount - Total fee amount to split
 * @param cfg - Game configuration with fee BPS values
 * @returns Split amounts: platform, monthly (competition pool), reserve, shop
 * 
 * @remarks
 * - Current split: 45% shop, 30% monthly, 20% reserve, 5% platform
 * - If BPS don't sum to 10000, remainder goes to shop bucket
 * - Monthly pool supports future competition features
 */
export function splitClassicFee(amount: Long, cfg: any): { platform: Long; monthly: Long; reserve: Long; shop: Long } {
    const platformBps = getConfiguredClassicPlatformFeeBps(cfg);  // 5%
    const monthlyBps = 3000;  // 30% for monthly pool
    const reserveBps = 2000;  // 20% (reduced from 45%)
    const shopBps = 4500;     // 45% (increased from 50%)
    
    const platform = calculateBpsAmount(amount, platformBps);
    const monthly = calculateBpsAmount(amount, monthlyBps);
    const reserve = calculateBpsAmount(amount, reserveBps);
    
    // If BPS sum to exactly 10000, calculate shop; otherwise assign remainder
    const shop = platformBps + monthlyBps + reserveBps + shopBps === 10000
        ? calculateBpsAmount(amount, shopBps)
        : amount.subtract(platform).subtract(monthly).subtract(reserve);
    
    return { platform, monthly, reserve, shop };
}
