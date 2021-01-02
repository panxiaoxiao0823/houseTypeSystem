console.log('进入app.js')

const Koa = require('koa')
var cors = require('koa-cors');
const app = new Koa()

// 配置跨域
app.use(cors());

const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const controller = require('./controller'); // 导入controller middleware:

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// 使用middleware
app.use(controller());

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

console.log('app.js is overed')

module.exports = app
