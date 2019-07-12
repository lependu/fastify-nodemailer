'use strict'
const Fastify = require('fastify')
const nodemailer = require('./')

const build = (options) => {
  const fastify = Fastify(options)

  fastify.register(nodemailer, {
    jsonTransport: true
  })

  fastify.route({
    method: 'GET',
    url: '/sendmail/:email',
    schema: {
      params: {
        email: { type: 'string', format: 'email' }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            messageId: { type: 'string' },
            recipient: { type: 'string' }
          }
        }
      }
    },
    handler: (req, reply, next) => {
      req.log.info('sendmail route')
      const { nodemailer } = fastify
      const recipient = req.params.email

      nodemailer.sendMail({
        from: 'sender@example.com',
        to: recipient,
        subject: 'foo',
        text: 'bar'
      }, (err, info) => {
        if (err) next(err)

        const { messageId, envelope: { to } } = info
        reply.send({
          messageId,
          recipient: to
        })
      })
    }
  })

  return fastify
}

if (require.main === module) {
  const fastify = build({
    logger: {
      level: 'info'
    }
  })
  fastify.listen(3000, err => {
    if (err) throw err
  })
}

module.exports = build
