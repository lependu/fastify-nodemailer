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
