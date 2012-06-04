class Railsdemo.Models.Shift extends Backbone.Model
  paramRoot: 'shift'

  defaults:
    start: null
    end: null
    training: null
    leasing: null
    task_id: null

class Railsdemo.Collections.ShiftsCollection extends Backbone.Collection
  model: Railsdemo.Models.Shift
  url: '/shifts'
