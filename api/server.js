const http = require('http')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const json = require('koa-json');
const uuid = require('uuid')

const app = new Koa()
app.use(bodyParser());
app.use(cors());
app.use(json());

let tickets = [
  {
    id: '000a70da-fc3d-42c2-bc38-29360bf7665f',
    name: 'Test 1',
    description: 'Test description 1',
    status: true,
    created: new Date()
  },
  {
    id: '000a70da-fc3d-42c2-bc38-29360bf7868f',
    name: 'Test 2',
    description: 'Test description 2',
    status: false,
    created: new Date()
  }
]

const getError = (reason, code) => {
  return {
    reason,
    code,
    message: 'Error!'
  }
}

const getSuccess = (reason, code) => {
  return {
    message: 'Success!'
  }
}

app.use(async ctx => {
  const { method, id } = ctx.request.query;

  switch (method) {
    case 'allTickets': {
      ctx.response.body = tickets.map(item => {
        return {
          id: item.id,
          name: item.name,
          status: item.status,
          created: item.created
        }
      });
      return;
    }

    case 'addNewTask': {
      let body = ctx.request.body
      if (body) {
        if (body.id) {
          let task = tickets.find(item => item.id === body.id)
          task.name = body.name
          task.description = body.description
        } else {
          tickets.push({
            id: uuid.v4(),
            name: body.name,
            status: body.status,
            description: body.description,
            created: new Date()
          })
        }

        ctx.response.body = getSuccess()
      }
      else getError('Not found', 404)
      return;
    }

    case 'setStatus': {
      let body = ctx.request.body
      if (body) {
        let task = tickets.find(item => item.id === body.id)
        if (task)
          task.status = body.status

        ctx.response.body = getSuccess()
      }
      else getError('Not found', 404)
      return;
    }

    case 'getDetail': {
      let body = ctx.request.body
      if (body) {
        let task = tickets.find(item => item.id === body.id)

        ctx.response.body = { description: task.description }
      }
      else getError('Not found', 404)
      return;
    }

    case 'editTask': {
      let body = ctx.request.body
      if (body) {
        ctx.response.body = tickets.find(item => item.id === body.id)
      }
      else getError('Not found', 404)
      return;
    }

    case 'delTask': {
      let body = ctx.request.body
      if (body) {
        let taskNum = tickets.findIndex(item => item.id === body.id)
        tickets.splice(taskNum, 1)
        ctx.response.body = getSuccess()
      }
      else getError('Not found', 404)
      return;
    }

    default:
      ctx.response.status = 404;
      return;
  }
})

const server = http.createServer(app.callback())

const port = 7070

server.listen(port, (error) => {
  if (error)
    console.log(error)
})
