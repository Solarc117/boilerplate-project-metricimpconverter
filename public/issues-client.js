/**
 * @param {object} data
 */
function stringify(data) {
  $('#jsonResult').text(JSON.stringify(data))
}
const log = console.log.bind(console),
  error = console.error.bind(console)

$('#getProjects').on('submit', e => {
  e.preventDefault()

  $.ajax({
    url: '/api/issues',
    success: stringify,
    error: stringify,
  })
})

$('#createProject').on('submit', e => {
  e.preventDefault()
  const data = new URLSearchParams($('#createProject').serialize()),
    projectName = data.get('project_name'),
    projectOwner = data.get('project_owner')

  $.ajax({
    url: `/api/issues/projects/${projectOwner}/${projectName}`,
    type: 'post',
    success: stringify,
    error: stringify,
  })
})

$('#getIssues').on('submit', e => {
  e.preventDefault()
  const data = new URLSearchParams($('#getIssues').serialize()),
    projectName = data.get('project_name')
  data.delete('project_name')

  $.ajax({
    url: `/api/issues/${projectName}?${data.toString()}`,
    type: 'get',
    success: stringify,
    error: stringify,
  })
})

$('#submitIssue').on('submit', e => {
  e.preventDefault()
  const data = new URLSearchParams($('#submitIssue').serialize()),
    projectName = data.get('project_name')
  data.delete('project_name')

  $.ajax({
    url: `/api/issues/${projectName}`,
    type: 'post',
    data: data.toString(),
    success: stringify,
    error: stringify,
  })
})

$('#issueIndex').on('submit', e => {
  e.preventDefault()
  const [{ value: project }, { value: index }] =
    $('#issueIndex').serializeArray()

  $.ajax({
    url: `/api/issues/${project}?index=${index}`,
    type: 'get',
    success(data) {
      if (Object.keys(data).length === 0)
        return stringify({
          error: `no issue at index ${index} of project ${project}`,
        })
      const { title, text, assigned_to, status_text, open } = data

      // This is so that the following update can access these fields, which it requires in order to issue its patch request.
      sessionStorage.setItem('project', project)
      sessionStorage.setItem('index', index)

      $('#update').removeClass('hidden')
      $('[name=new-title]').val(title)
      $('[name=new-text]').val(text)
      $('[name=new-assigned-to]').val(assigned_to)
      $('[name=new-status-text]').val(status_text)
      $('[name=new-open]').prop('checked', open)
    },
    error: stringify,
  })
})

$('#update').on('submit', e => {
  e.preventDefault()
  const [project, index] = ['project', 'index'].map(item =>
    sessionStorage.getItem(item)
  )

  const data = `${$('#update')
    .serialize()
    .replace(/new-/g, '')
    .replace(/-/g, '_')}`

  $.ajax({
    url: `/api/issues/${project}?index=${index}`,
    type: 'patch',
    data,
    success(data) {
      stringify(data)
      sessionStorage.clear()
      $('#update').addClass('hidden')
    },
    error: stringify,
  })
})

$('#delete').on('submit', e => {
  const data = new URLSearchParams(
      new FormData(document.querySelector('#delete'))
    ),
    project = data.get('project')
  data.delete('project')

  e.preventDefault()
  $.ajax({
    url: `/api/issues/${project}`,
    type: 'delete',
    data: data.toString(),
    success: stringify,
    error: stringify,
  })
})
