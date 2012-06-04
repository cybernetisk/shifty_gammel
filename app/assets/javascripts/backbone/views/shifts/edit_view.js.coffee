Railsdemo.Views.Shifts ||= {}

class Railsdemo.Views.Shifts.EditView extends Backbone.View
  template : JST["backbone/templates/shifts/edit"]

  events :
    "submit #edit-shift" : "update"

  update : (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.save(null,
      success : (shift) =>
        @model = shift
        window.location.hash = "/#{@model.id}"
    )

  render : ->
    $(@el).html(@template(@model.toJSON() ))

    this.$("form").backboneLink(@model)

    return this
