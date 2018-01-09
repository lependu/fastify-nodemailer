'use strict'

const t = require('tap')
const Fastify = require('fastify')
const nodemailer = require('./')
const example = require('./example')

const { test } = t

test('nodemailer exists', t => {
  t.plan(2)

  const fastify = Fastify()

  fastify
    .register(nodemailer, {
      jsonTransport: true
    }, err => {
      t.error(err)
      t.ok(fastify.nodemailer)
    })

  fastify.close()
})

test('nodemailer#sendMail', t => {
  t.plan(7)

  const fastify = Fastify()

  fastify
    .register(nodemailer, {
      jsonTransport: true
    }, err => {
      t.error(err)
    })

  fastify.ready(err => {
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

  fastify.close()
})

test('Example', t => {
  t.plan(3)

  const fastify = example()

  fastify.inject({
    method: 'GET',
    url: '/sendmail/baz@example.com'
  }, (err, res) => {
    t.error(err)
    let { statusCode, payload } = res
    t.equal(statusCode, 200)
    t.ok(~payload.indexOf('"baz@example.com"'))
  })
  fastify.close()
})
