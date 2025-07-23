'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::user-wallet.user-wallet', ({ strapi }) => ({
  // Custom method to authenticate with TRON wallet
  async authenticateWallet(ctx) {
    try {
      const { wallet_address, signature, message } = ctx.request.body;

      if (!wallet_address || !signature || !message) {
        return ctx.badRequest('Missing required fields');
      }

      // Verify TRON wallet signature
      const TronWeb = require('tronweb');
      const tronWeb = new TronWeb({
        fullHost: process.env.TRON_NODE || 'https://api.trongrid.io'
      });

      const isValid = await tronWeb.trx.verifyMessage(
        tronWeb.toHex(message),
        signature,
        wallet_address
      );

      if (!isValid) {
        return ctx.unauthorized('Invalid wallet signature');
      }

      // Find or create user
      let user = await strapi.entityService.findMany('api::user-wallet.user-wallet', {
        filters: { wallet_address }
      });

      if (user.length === 0) {
        // New user - redirect to registration
        return ctx.send({
          success: true,
          exists: false,
          wallet_address,
          message: 'User not found, registration required'
        });
      }

      user = user[0];

      // Update last login
      await strapi.entityService.update('api::user-wallet.user-wallet', user.id, {
        data: { last_login: new Date() }
      });

      return ctx.send({
        success: true,
        exists: true,
        user: {
          id: user.id,
          wallet_address: user.wallet_address,
          username: user.username,
          plan: user.plan,
          tokens_available: user.tokens_available,
          total_scans: user.total_scans
        }
      });

    } catch (error) {
      strapi.log.error('Wallet authentication error:', error);
      return ctx.internalServerError('Authentication failed');
    }
  },

  // Register new user with wallet
  async registerWallet(ctx) {
    try {
      const { wallet_address, username, signature, message } = ctx.request.body;

      if (!wallet_address || !username || !signature || !message) {
        return ctx.badRequest('Missing required fields');
      }

      // Verify TRON wallet signature
      const TronWeb = require('tronweb');
      const tronWeb = new TronWeb({
        fullHost: process.env.TRON_NODE || 'https://api.trongrid.io'
      });

      const isValid = await tronWeb.trx.verifyMessage(
        tronWeb.toHex(message),
        signature,
        wallet_address
      );

      if (!isValid) {
        return ctx.unauthorized('Invalid wallet signature');
      }

      // Check if wallet already exists
      const existingWallet = await strapi.entityService.findMany('api::user-wallet.user-wallet', {
        filters: { wallet_address }
      });

      if (existingWallet.length > 0) {
        return ctx.conflict('Wallet already registered');
      }

      // Check if username already exists
      const existingUsername = await strapi.entityService.findMany('api::user-wallet.user-wallet', {
        filters: { username }
      });

      if (existingUsername.length > 0) {
        return ctx.conflict('Username already taken');
      }

      // Create new user
      const newUser = await strapi.entityService.create('api::user-wallet.user-wallet', {
        data: {
          wallet_address,
          username: username.trim(),
          plan: 'Free',
          tokens_available: 3,
          total_scans: 0,
          is_active: true,
          last_login: new Date(),
          registration_ip: ctx.request.ip
        }
      });

      return ctx.send({
        success: true,
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          wallet_address: newUser.wallet_address,
          username: newUser.username,
          plan: newUser.plan,
          tokens_available: newUser.tokens_available
        }
      });

    } catch (error) {
      strapi.log.error('Wallet registration error:', error);
      return ctx.internalServerError('Registration failed');
    }
  },

  // Consume token for scan
  async consumeToken(ctx) {
    try {
      const { wallet_address } = ctx.request.body;

      if (!wallet_address) {
        return ctx.badRequest('Wallet address required');
      }

      const users = await strapi.entityService.findMany('api::user-wallet.user-wallet', {
        filters: { wallet_address }
      });

      if (users.length === 0) {
        return ctx.notFound('User not found');
      }

      const user = users[0];

      if (user.tokens_available <= 0 && user.plan !== 'Unlimited') {
        return ctx.forbidden('No tokens available');
      }

      // Consume token (except for Unlimited plan)
      let updatedTokens = user.tokens_available;
      if (user.plan !== 'Unlimited') {
        updatedTokens = Math.max(0, user.tokens_available - 1);
      }

      await strapi.entityService.update('api::user-wallet.user-wallet', user.id, {
        data: {
          tokens_available: updatedTokens,
          total_scans: user.total_scans + 1,
          last_scan: new Date()
        }
      });

      return ctx.send({
        success: true,
        tokens_remaining: updatedTokens,
        total_scans: user.total_scans + 1
      });

    } catch (error) {
      strapi.log.error('Token consumption error:', error);
      return ctx.internalServerError('Token consumption failed');
    }
  },

  // Update user plan after payment
  async updatePlan(ctx) {
    try {
      const { wallet_address, plan, tokens, subscription_expires } = ctx.request.body;

      if (!wallet_address || !plan || tokens === undefined) {
        return ctx.badRequest('Missing required fields');
      }

      const users = await strapi.entityService.findMany('api::user-wallet.user-wallet', {
        filters: { wallet_address }
      });

      if (users.length === 0) {
        return ctx.notFound('User not found');
      }

      const user = users[0];

      const updatedUser = await strapi.entityService.update('api::user-wallet.user-wallet', user.id, {
        data: {
          plan,
          tokens_available: tokens,
          subscription_expires: subscription_expires ? new Date(subscription_expires) : null
        }
      });

      return ctx.send({
        success: true,
        message: 'Plan updated successfully',
        user: {
          id: updatedUser.id,
          wallet_address: updatedUser.wallet_address,
          username: updatedUser.username,
          plan: updatedUser.plan,
          tokens_available: updatedUser.tokens_available,
          subscription_expires: updatedUser.subscription_expires
        }
      });

    } catch (error) {
      strapi.log.error('Plan update error:', error);
      return ctx.internalServerError('Plan update failed');
    }
  },

  // Get user statistics
  async getStats(ctx) {
    try {
      const totalUsers = await strapi.entityService.count('api::user-wallet.user-wallet');
      
      const activeUsers = await strapi.entityService.count('api::user-wallet.user-wallet', {
        filters: {
          last_login: {
            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      const planStats = await strapi.db.query('api::user-wallet.user-wallet').groupBy({
        groupBy: ['plan'],
        select: ['plan'],
        count: '*'
      });

      const totalScans = await strapi.db.query('api::user-wallet.user-wallet').sum('total_scans');

      return ctx.send({
        success: true,
        stats: {
          totalUsers,
          activeUsers,
          planStats,
          totalScans: totalScans || 0
        }
      });

    } catch (error) {
      strapi.log.error('Stats error:', error);
      return ctx.internalServerError('Failed to get stats');
    }
  }
}));