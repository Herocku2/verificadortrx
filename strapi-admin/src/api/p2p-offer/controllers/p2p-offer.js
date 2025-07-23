'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::p2p-offer.p2p-offer', ({ strapi }) => ({
  // Obtener ofertas por país
  async findByCountry(ctx) {
    try {
      const { country } = ctx.params;
      const { type, currency, payment_method, min_amount, max_amount } = ctx.query;

      const filters = {
        pais_codigo: country,
        status: 'activa'
      };

      if (type) filters.tipo = type;
      if (currency) filters.moneda_local = currency;
      if (payment_method) filters.metodo_pago = payment_method;
      if (min_amount) filters.cantidad_min = { $gte: parseFloat(min_amount) };
      if (max_amount) filters.cantidad_max = { $lte: parseFloat(max_amount) };

      const offers = await strapi.entityService.findMany('api::p2p-offer.p2p-offer', {
        filters,
        sort: { createdAt: 'desc' },
        populate: ['ordenes']
      });

      return ctx.send({
        data: offers,
        meta: {
          pagination: {
            total: offers.length
          }
        }
      });
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Crear nueva oferta
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      
      // Validar wallet
      if (!data.wallet || data.wallet.length !== 34 || !data.wallet.startsWith('T')) {
        return ctx.badRequest('Wallet TRX inválida');
      }

      // Obtener IP del usuario
      const clientIP = ctx.request.ip || ctx.request.socket.remoteAddress;
      data.ip_creacion = clientIP;
      data.ultima_actividad = new Date();

      // Detectar país por IP (simulado)
      if (!data.pais_codigo) {
        data.pais_codigo = await this.detectCountryByIP(clientIP);
      }

      const offer = await strapi.entityService.create('api::p2p-offer.p2p-offer', {
        data
      });

      return ctx.send({ data: offer });
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Actualizar oferta
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;

      // Verificar que el usuario sea el propietario de la oferta
      const existingOffer = await strapi.entityService.findOne('api::p2p-offer.p2p-offer', id);
      
      if (!existingOffer) {
        return ctx.notFound('Oferta no encontrada');
      }

      // Aquí deberías verificar que el wallet del usuario coincida con el de la oferta
      // En un entorno real, usarías autenticación por wallet

      data.ultima_actividad = new Date();

      const updatedOffer = await strapi.entityService.update('api::p2p-offer.p2p-offer', id, {
        data
      });

      return ctx.send({ data: updatedOffer });
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Pausar/activar oferta
  async toggleStatus(ctx) {
    try {
      const { id } = ctx.params;
      const { wallet } = ctx.request.body;

      const offer = await strapi.entityService.findOne('api::p2p-offer.p2p-offer', id);
      
      if (!offer) {
        return ctx.notFound('Oferta no encontrada');
      }

      if (offer.wallet !== wallet) {
        return ctx.forbidden('No tienes permisos para modificar esta oferta');
      }

      const newStatus = offer.status === 'activa' ? 'pausada' : 'activa';

      const updatedOffer = await strapi.entityService.update('api::p2p-offer.p2p-offer', id, {
        data: {
          status: newStatus,
          ultima_actividad: new Date()
        }
      });

      return ctx.send({ data: updatedOffer });
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Obtener ofertas por wallet
  async findByWallet(ctx) {
    try {
      const { wallet } = ctx.params;
      const { status } = ctx.query;

      const filters = { wallet };
      if (status) filters.status = status;

      const offers = await strapi.entityService.findMany('api::p2p-offer.p2p-offer', {
        filters,
        sort: { createdAt: 'desc' },
        populate: ['ordenes']
      });

      return ctx.send({
        data: offers,
        meta: {
          pagination: {
            total: offers.length
          }
        }
      });
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Función auxiliar para detectar país por IP
  async detectCountryByIP(ip) {
    // En un entorno real, usarías una API como ipapi.co
    // Por ahora, retornamos un país por defecto
    const ipRanges = {
      '179.7': 'CO',
      '190.26': 'CO',
      '187.141': 'MX',
      '201.131': 'MX',
      '190.210': 'AR',
      '181.31': 'AR'
    };

    const ipPrefix = ip.split('.').slice(0, 2).join('.');
    return ipRanges[ipPrefix] || 'CO'; // Default a Colombia
  }
}));