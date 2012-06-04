Railsdemo.Views.Shifts ||= {}

class Railsdemo.Views.Shifts.IndexView extends Backbone.View
  template: JST["backbone/templates/shifts/index"]

  initialize: () ->
    @options.shifts.bind('reset', @addAll)

  addAll: () =>
    @options.shifts.each(@addOne)

  addOne: (shift) =>
    view = new Railsdemo.Views.Shifts.ShiftView({model : shift})
    @$("tbody").append(view.render().el)

  render: =>
    $(@el).html(@template(shifts: @options.shifts.toJSON() ))
    @addAll()

    return this
