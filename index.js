'use strict'

const fp = require('fastify-plugin')
const Nodemailer = require('nodemailer')

const { createTransport } = Nodemailer

const fastifyNodemailer = (fastify, options, next) => {
  let transporter = null

  try {
    transporter = createTransport(options)
  } catch (err) {
    return next(err)
  }

  fastify
    .decorate('nodemailer', transporter)
    .addHook('onClose', close)

  next()
}

const close = (fastify, done) => {
  fastify.nodemailer.close(done)
}

module.exports = fp(fastifyNodemailer, {
  fastify: '>=3.0.0',
  name: 'fastify-nodemailer'
})
