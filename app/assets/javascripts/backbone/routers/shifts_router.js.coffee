class Railsdemo.Routers.ShiftsRouter extends Backbone.Router
  initialize: (options) ->
    @shifts = new Railsdemo.Collections.ShiftsCollection()
    @shifts.reset options.shifts
  
  routes:
    "new"      : "newShift"
    "index"    : "index"
    ":id/edit" : "edit"
    ":id"      : "show"
    ".*"        : "index"

  newShift: ->
    @view = new Railsdemo.Views.Shifts.NewView(collection: @shifts)
    $("#shifts").html(@view.render().el)

  index: ->
    @view = new Railsdemo.Views.Shifts.IndexView(shifts: @shifts)
    $("#shifts").html(@view.render().el)

  show: (id) ->
    shift = @shifts.get(id)

    @view = new Railsdemo.Views.Shifts.ShowView(model: shift)
    $(@view.render().el).dialog()

  edit: (id) ->
    shift = @shifts.get(id)

    @view = new Railsdemo.Views.Shifts.EditView(model: shift)
    $(@view.render().el).dialog()
