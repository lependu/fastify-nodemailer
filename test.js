'use strict'

const t = require('tap')
const Fastify = require('fastify')
const nodemailer = require('./')

t.jobs = 4

t.test('nodemailer exists', t => {
  const fastify = Fastify()

  fastify
    .register(nodemailer, {
      jsonTransport: true
    })
    .ready(err => {
      t.error(err)
      t.ok(fastify.nodemailer)
      fastify.close()
      t.end()
    })
})

t.test('createTransport error', t => {
  const fastify = Fastify()

  fastify
    .register(nodemailer, 'this will throw')
    .ready(err => {
      t.ok(err instanceof Error)
      t.match(err.message, /Cannot create property 'mailer'/)
      fastify.close()
      t.end()
    })
})

t.test('nodemailer#sendMail', t => {
  const fastify = Fastify()

  fastify
    .register(nodemailer, {
      jsonTransport: true
    })
    .ready(err => {
      t.error(err)
      const { nodemailer } = fastify
      nodemailer.sendMail({
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'foo',
        text: 'bar'
      }, (err, info) => {
        t.error(err)
        t.equal(info.envelope.from, 'sender@example.com')
        t.equal(info.envelope.to[0], 'recipient@example.com')
        t.ok(~info.message.indexOf('"subject":"foo"'))
        t.ok(~info.message.indexOf('"text":"bar"'))
        fastify.close()
        t.end()
      })
    })
})

t.test('customTransport', t => {
  const fastify = Fastify()

  const transport = {
    name: 'minimal',
    version: '0.1.0',
    send: (mail, callback) => {
      const envelope = mail.message.getEnvelope()
      const messageId = mail.message.messageId()
      callback(null, {
        envelope,
        messageId
      })
    }
  }

  fastify
    .register(nodemailer, transport)
    .ready(err => {
      t.error(err)
      const { nodemailer } = fastify
      nodemailer.sendMail({
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'foo',
        text: 'bar'
      }, (err, info) => {
        t.error(err)
        t.equal(info.envelope.from, 'sender@example.com')
        t.equal(info.envelope.to[0], 'recipient@example.com')
        fastify.close()
        t.end()
      })
    })
})
