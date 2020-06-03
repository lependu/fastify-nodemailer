# fastify-nodemailer

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
[![Build Status](https://travis-ci.org/lependu/fastify-nodemailer.svg?branch=master)](https://travis-ci.org/lependu/fastify-nodemailer)
[![Known Vulnerabilities](https://snyk.io/test/github/lependu/fastify-nodemailer/badge.svg)](https://snyk.io/test/github/lependu/fastify-nodemailer)
[![Coverage Status](https://coveralls.io/repos/github/lependu/fastify-nodemailer/badge.svg?branch=master)](https://coveralls.io/github/lependu/fastify-nodemailer?branch=master)
![npm (scoped)](https://img.shields.io/npm/v/fastify-webpack-hmr/latest)
![npm](https://img.shields.io/npm/dm/fastify-nodemailer.svg)


Fastify nodemailer plugin, with this you can share the same nodemailer transporter in every part of your server.

Under the hood the it wraps [nodemailer](https://github.com/nodemailer/nodemailer) transporter and the options that you pass to `register` will be passed to the transporter. For configuration/usage details please check the [nodemailer documentation](https://nodemailer.com/usage/).

## Install
```
npm i fastify-nodemailer --save
```

## Versions

The plugin supports the following `Fastify` and `Nodemailer` versions. Please refer to corresponding branch in PR and issues.

version | branch | fastify | nodemailer | End of support
--------|--------|---------|------------|---------------  
1.x | [1.x](https://github.com/lependu/fastify-nodemailer/tree/1.x) | 1.x | 4.x | EOL   
2.x | [2.x](https://github.com/lependu/fastify-nodemailer/tree/2.x) | 2.x | 4.x | TBD  
3.x | [master](https://github.com/lependu/fastify-nodemailer) | 2.x | 5.x | [Deprecated](https://github.com/nodemailer/nodemailer/issues/979)
4.x | [4.x](https://github.com/lependu/fastify-nodemailer/tree/4.x) | 2.x | 6.x | TBD
5.x | [master](https://github.com/lependu/fastify-nodemailer) | 3.x | 6.x | TBD

## Usage
Add it to you project with `register` and you are done!
You can access the transporter via `fastify.nodemailer` and *sendMail()* via `fastify.nodemailer.sendMail()`.
```js
const fastify = require('fastify')()

fastify.register(require('fastify-nodemailer'), {
  pool: true,
  host: 'smtp.example.com',
  port: 465,
  secure: true, // use TLS
  auth: {
      user: 'username',
      pass: 'password'
  }
})

fastify.get('/sendmail/:email', (req, reply, next) => {
  let { nodemailer } = fastify
  let recipient = req.params.email

  fastify.nodemailer.sendMail({
    from: 'sender@example.com',
    to: recipient,
    subject: 'foo',
    text: 'bar'
  }, (err, info) => {
    if (err) next(err)
    reply.send({
      messageId: info.messageId
    })
  })
})

fastify.listen(3000, err => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
```
## Custom transports

By default, passing an object as options to the plugin will configure nodemailer's main transport (SMTP).

If you need a custom transport, simply initialize the transport, and pass it to the plugin instead of an options object. For example, using the `nodemailer-sparkpost-transport`:

```js
const fastify = require('fastify')()

const sparkPostTransport = require('nodemailer-sparkpost-transport')

const sparkPostTransportOptions = {
  sparkPostApiKey: 'MY_API_KEY'
}

fastify.register(require('fastify-nodemailer'), sparkPostTransport(sparkPostTransportOptions))

// or

const sparkPostTransportInstance = sparkPostTransport(sparkPostTransportOptions)

fastify.register(require('fastify-nodemailer'), sparkPostTransportInstance)
```

Then, later:

```js
fastify.get('/sendmail', (req, reply, next) => {

  const sendOptions = {
    content: {
      template_id: 'my_template_id',
      use_draft_template: false
    },
    "recipients": [
      {
        "address": {
          "email": "sender@example.com",
          "name": "John Doe"
        },
        "substitution_data": {
          username: "John Doe"
        }
      }
    ]
  };

  fastify.nodemailer.sendMail(sendOptions, (err, info) => {
    if (err) next(err)
    reply.send({
      messageId: info.messageId
    })
  })

})
```

## Multiple transports

Since fastify-nodemailer fully supports Fastify's built-in [encapsulation](https://www.fastify.io/docs/latest/Plugins-Guide/#register) feature, all you need to do is register this plugin with your custom transporter and the corresponding route in a new context.

## License

Licensed under [MIT](./LICENSE).

