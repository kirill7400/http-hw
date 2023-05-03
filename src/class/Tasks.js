import {all} from "core-js/internals/document-all";

class Tasks {
  constructor() {
    this.headers = {
      'Content-Type': 'application/json'
    }
    this.id = null

    this.desk = document.querySelector('.desk-body')
    this.modal = document.querySelector('.modal')

    this.all = 'http://localhost:7070/?method=allTickets'
    this.url = 'http://localhost:7070/?'

    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.addNewTask = this.addNewTask.bind(this)
    this.handler = this.handler.bind(this)

    document.querySelector('.add-btn').addEventListener('click', () => this.openModal('Добавить задачу'))
    document.querySelector('.modal-cancel').addEventListener('click', this.closeModal)
    this.modal.querySelector('.modal-ok').addEventListener('click', this.addNewTask)
    this.desk.addEventListener('click', this.handler)
  }


  getAllTask() {
    fetch(this.all)
      .then(response  => response.json())
      .then(res => this.renderTasks(res))
      .catch(error => console.log(error))
  }

  addNewTask() {
    let name = this.modal.querySelector('.name')
    let description = this.modal.querySelector('.description')

    fetch(this.url + new URLSearchParams({method: 'addNewTask'}), {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        name: name.value,
        status: false,
        description: description.value,
        id: this.id ? this.id : null
      })
    })
      .then(response  => response.json())
      .then(res => {
        this.id ? alert('Задача изменена!') : alert('Задача добавлена!')
        this.getAllTask()
        this.closeModal()
        this.id = null
      })
      .catch(error => console.log(error))
  }

  handler(e) {
    try {
      if (e.target.classList.contains('checkbox')) {
        let id = e.target.closest('.task').getAttribute('data-id')
        let value = e.target.checked
        this.setCheckbox(id, value)
      }

      else if (e.target.closest('.task-data') && e.target.closest('.task-data').classList.contains('task-data')) {
        let id = e.target.closest('.task').getAttribute('data-id')
        this.showDetails(id, e.target.closest('.task'))
      }

      else if (e.target.classList.contains('btn-edit')) {
        let id = e.target.closest('.task').getAttribute('data-id')
        this.editTask(id)
      }

      else if (e.target.classList.contains('btn-del')) {
        let id = e.target.closest('.task').getAttribute('data-id')
        this.delTask(id)
      }
    }
    catch (e) {
      console.log(e)
    }
  }

  setCheckbox(id, value) {
    fetch(this.url + new URLSearchParams({method: 'setStatus'}), {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        id: id,
        status: value
      })
    })
      .then(response  => response.json())
      .then(res => {
        alert('Статус изменен!')
        this.getAllTask()
      })
      .catch(error => console.log(error))
  }

  showDetails(id, el) {
    let description = el.querySelector('.task-full-data')
    if (description.textContent) {
      description.textContent = ''
      description.classList.add('element-none')
      return
    }

    fetch(this.url + new URLSearchParams({method: 'getDetail'}), {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        id: id
      })
    })
      .then(response  => response.json())
      .then(res => {
        description.textContent = res.description
        description.classList.remove('element-none')
      })
      .catch(error => console.log(error))
  }

  editTask(id) {
    fetch(this.url + new URLSearchParams({method: 'editTask'}), {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        id: id
      })
    })
      .then(response  => response.json())
      .then(res => {
        this.openModal('Редактировать задачу')
        this.modal.querySelector('.name').value = res.name
        this.modal.querySelector('.description').value = res.description
        this.id = id
      })
      .catch(error => console.log(error))
  }

  delTask(id) {
    fetch(this.url + new URLSearchParams({method: 'delTask'}), {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        id: id
      })
    })
      .then(response  => response.json())
      .then(() => {
        alert('Задача удалена!')
        this.getAllTask()
      })
      .catch(error => console.log(error))
  }

  openModal(name) {
    this.modal.classList.toggle('element-none')
    this.modal.querySelector('.modal-header').textContent = name
  }

  closeModal() {
    this.modal.classList.add('element-none')

    this.modal.querySelector('.name').value = ''
    this.modal.querySelector('.description').value = ''
  }

  renderTasks(data) {
    if (!data) return

    this.desk.querySelectorAll('.task').forEach(task => task.remove())

    data.forEach(task => {
      let divTask = document.createElement('div')
      let divMainData = document.createElement('div')
      let divTaskCheckbox = document.createElement('div')
      let divTaskData = document.createElement('div')
      let divTaskEdit = document.createElement('div')
      let divTaskFull = document.createElement('div')
      let checkbox = document.createElement('input')

      let divTaskDataName = document.createElement('div')
      let divTaskDataDate = document.createElement('div')

      let btnAdd = document.createElement('button')
      let btnDel = document.createElement('button')

      divTask.insertBefore(divMainData, null)
      divTask.insertBefore(divTaskFull, null)
      divMainData.insertBefore(divTaskCheckbox, null)
      divMainData.insertBefore(divTaskData, null)
      divMainData.insertBefore(divTaskEdit, null)
      divTaskData.insertBefore(divTaskDataName, null)
      divTaskData.insertBefore(divTaskDataDate, null)
      divTaskEdit.insertBefore(btnAdd, null)
      divTaskEdit.insertBefore(btnDel, null)
      divTaskCheckbox.insertBefore(checkbox, null)

      divTask.classList.add('task')
      divMainData.classList.add('main-data')
      divTaskFull.classList.add('task-full-data')
      divTaskFull.classList.add('element-none')
      divTaskCheckbox.classList.add('task-checkbox')
      divTaskData.classList.add('task-data')
      divTaskDataName.classList.add('task-data-name')
      divTaskDataDate.classList.add('task-data-date')
      divTaskEdit.classList.add('task-edit')
      btnAdd.classList.add('btn-edit')
      btnDel.classList.add('btn-del')
      checkbox.classList.add('checkbox')

      btnAdd.innerHTML = '&#9998;'
      btnDel.innerHTML = '&#10006;'
      checkbox.type = 'checkbox'
      checkbox.checked = task.status
      divTaskDataName.textContent = task.name
      divTaskDataDate.textContent = task.created
      divTask.setAttribute('data-id', task.id)

      this.desk.insertBefore(divTask, null)
    })
  }
}

export  default Tasks
