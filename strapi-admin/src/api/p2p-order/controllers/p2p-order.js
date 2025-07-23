'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::p2p-order.p2p-order', ({ strapi }) => ({
  // Crear nueva orden
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      
      // Validar que la oferta existe y está activa
      const offer = await strapi.entityService.findOne('api::p2p-offer.p2p-offer', data.oferta);
      
      if (!offer || offer.status !== 'activa') {
        return ctx.badRequest('Oferta no disponible');
      }

      // Validar cantidad
      if (data.cantidad_usdt < offer.cantidad_min || data.cantidad_usdt > offer.cantidad_max) {
        return ctx.badRequest('Cantidad fuera del rango permitido');
      }

      // Calcular tiempo límite
      const timeLimit = new Date();
      timeLimit.setMinutes(timeLimit.getMinutes() + offer.tiempo_limite);

      // Crear orden
      const orderData = {
        ...data,
        wallet_vendedor: offer.wallet,
        precio_acordado: offer.precio_usdt,
        cantidad_fiat: data.cantidad_usdt * offer.precio_usdt,
        moneda_fiat: offer.moneda_local,
        metodo_pago_usado: offer.metodo_pago,
        tiempo_limite: timeLimit,
        estado: 'pendiente'
      };

      const order = await strapi.entityService.create('api::p2p-order.p2p-order', {
        data: orderData,
        populate: ['oferta', 'chat_messages']
      });

      // Crear mensaje inicial del sistema
      await strapi.entityService.create('api::p2p-chat.p2p-chat', {
        data: {
          order: order.id,
          wallet_remitente: 'SYSTEM',
          mensaje: `Orden creada. El comprador debe realizar el pago en ${offer.tiempo_limite} minutos.`,
          tipo_mensaje: 'sistema'
        }
      });

      return ctx.send({ data: order });
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Marcar pago como realizado
  async markAsPaid(ctx) {
    try {
      const { id } = ctx.params;
      const { wallet, comprobante_pago, notas } = ctx.request.body;

      const order = await strapi.entityService.findOne('api::p2p-order.p2p-order', id);
      
      if (!order) {
        return ctx.notFound('Orden no encontrada');
      }

      if (order.wallet_comprador !== wallet) {
        return ctx.forbidden('No tienes permisos para modificar esta orden');
      }

      if (order.estado !== 'pendiente') {
        return ctx.badRequest('La orden no está en estado pendiente');
      }

      const updatedOrder = await strapi.entityService.update('api::p2p-order.p2p-order', id, {
        data: {
          estado: 'pagado',
          fecha_pago: new Date(),
          comprobante_pago,
          notas_comprador: notas
        },
        populate: ['oferta', 'chat_messages']
      });

      // Crear mensaje del sistema
      await strapi.entityService.create('api::p2p-chat.p2p-chat', {
        data: {
          order: id,
          wallet_remitente: 'SYSTEM',
          mensaje: 'El comprador ha marcado el pago como realizado. Esperando confirmación del vendedor.',
          tipo_mensaje: 'sistema'
        }
      });

      return ctx.send({ data: updatedOrder });
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Confirmar recepción del pago
  async confirmPayment(ctx) {
    try {
      const { id } = ctx.params;
      const { wallet, notas } = ctx.request.body;

      const order = await strapi.entityService.findOne('api::p2p-order.p2p-order', id);
      
      if (!order) {
        return ctx.notFound('Orden no encontrada');
      }

      if (order.wallet_vendedor !== wallet) {
        return ctx.forbidden('No tienes permisos para modificar esta orden');
      }

      if (order.estado !== 'pagado') {
        return ctx.badRequest('La orden no está en estado pagado');
      }

      const updatedOrder = await strapi.entityService.update('api::p2p-order.p2p-order', id, {
        data: {
          estado: 'confirmado',
          fecha_confirmacion: new Date(),
          notas_vendedor: notas
        },
        populate: ['oferta', 'chat_messages']
      });

      // Crear mensaje del sistema
      await strapi.entityService.create('api::p2p-chat.p2p-chat', {
        data: {
          order: id,
          wallet_remitente: 'SYSTEM',
          mensaje: 'El vendedor ha confirmado la recepción del pago. Liberando USDT...',
          tipo_mensaje: 'sistema'
        }
      });

      // Aquí se debería liberar el USDT del escrow
      // En un entorno real, esto sería una transacción blockchain

      return ctx.send({ data: updatedOrder });
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Completar orden
  async complete(ctx) {
    try {
      const { id } = ctx.params;

      const order = await strapi.entityService.findOne('api::p2p-order.p2p-order', id);
      
      if (!order) {
        return ctx.notFound('Orden no encontrada');
      }

      if (order.estado !== 'confirmado') {
        return ctx.badRequest('La orden no está en estado confirmado');
      }

      const updatedOrder = await strapi.entityService.update('api::p2p-order.p2p-order', id, {
        data: {
          estado: 'completado',
          fecha_completado: new Date()
        },
        populate: ['oferta', 'chat_messages']
      });

      // Actualizar estadísticas de la oferta
      const offer = await strapi.entityService.findOne('api::p2p-offer.p2p-offer', order.oferta);
      await strapi.entityService.update('api::p2p-offer.p2p-offer', order.oferta, {
        data: {
          trades_completados: offer.trades_completados + 1,
          ultima_actividad: new Date()
        }
      });

      // Crear mensaje del sistema
      await strapi.entityService.create('api::p2p-chat.p2p-chat', {
        data: {
          order: id,
          wallet_remitente: 'SYSTEM',
          mensaje: 'Orden completada exitosamente. ¡Gracias por usar TRXGuardian P2P!',
          tipo_mensaje: 'sistema'
        }
      });

      return ctx.send({ data: updatedOrder });
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Abrir disputa
  async openDispute(ctx) {
    try {
      const { id } = ctx.params;
      const { wallet, razon } = ctx.request.body;

      const order = await strapi.entityService.findOne('api::p2p-order.p2p-order', id);
      
      if (!order) {
        return ctx.notFound('Orden no encontrada');
      }

      if (order.wallet_comprador !== wallet && order.wallet_vendedor !== wallet) {
        return ctx.forbidden('No tienes permisos para abrir disputa en esta orden');
      }

      if (!['pagado', 'confirmado'].includes(order.estado)) {
        return ctx.badRequest('No se puede abrir disputa en el estado actual');
      }

      const updatedOrder = await strapi.entityService.update('api::p2p-order.p2p-order', id, {
        data: {
          estado: 'disputado',
          disputa_razon: razon
        },
        populate: ['oferta', 'chat_messages']
      });

      // Crear mensaje del sistema
      await strapi.entityService.create('api::p2p-chat.p2p-chat', {
        data: {
          order: id,
          wallet_remitente: 'SYSTEM',
          mensaje: `Disputa abierta por ${wallet.substring(0, 8)}... Razón: ${razon}`,
          tipo_mensaje: 'sistema'
        }
      });

      return ctx.send({ data: updatedOrder });
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Obtener órdenes por wallet
  async findByWallet(ctx) {
    try {
      const { wallet } = ctx.params;
      const { status, type } = ctx.query;

      let filters = {
        $or: [
          { wallet_comprador: wallet },
          { wallet_vendedor: wallet }
        ]
      };

      if (status) filters.estado = status;

      const orders = await strapi.entityService.findMany('api::p2p-order.p2p-order', {
        filters,
        sort: { createdAt: 'desc' },
        populate: ['oferta', 'chat_messages']
      });

      return ctx.send({
        data: orders,
        meta: {
          pagination: {
            total: orders.length
          }
        }
      });
    } catch (err) {
      ctx.throw(500, err);
    }
  }
}));