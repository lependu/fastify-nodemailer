'use strict'

const tap = require('tap')
const Fastify = require('fastify')
const nodemailer = require('./')

const { test } = tap

test('nodemailer exists', t => {
  t.plan(2)

  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))

  fastify
    .register(nodemailer, {
      jsonTransport: true
    })
    .ready(err => {
      t.error(err)
      t.ok(fastify.nodemailer)
    })
})

test('createTransport error', t => {
  t.plan(2)

  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))

  fastify
    .register(nodemailer, 'this will throw')
    .ready(err => {
      t.ok(err instanceof Error)
      t.match(err.message, /Cannot create property 'mailer'/)
    })
})

test('nodemailer#sendMail', t => {
  t.plan(6)

  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))

  fastify
    .register(nodemailer, {
      jsonTransport: true
    })
    .ready(err => {
      t.error(err)
      let { nodemailer } = fastify
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
      })
    })
})

test('customTransport', t => {
  t.plan(4)

  const fastify = Fastify()
  t.tearDown(fastify.close.bind(fastify))

  let transport = {
    name: 'minimal',
    version: '0.1.0',
    send: (mail, callback) => {
      let envelope = mail.message.getEnvelope()
      let messageId = mail.message.messageId()
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
      let { nodemailer } = fastify
      nodemailer.sendMail({
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'foo',
        text: 'bar'
      }, (err, info) => {
        t.error(err)
        t.equal(info.envelope.from, 'sender@example.com')
        t.equal(info.envelope.to[0], 'recipient@example.com')
      })
    })
})
