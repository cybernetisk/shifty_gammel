Railsdemo.Views.Shifts ||= {}

class Railsdemo.Views.Shifts.NewView extends Backbone.View
  template: JST["backbone/templates/shifts/new"]

  events:
    "submit #new-shift": "save"

  constructor: (options) ->
    super(options)
    @model = new @collection.model()

    @model.bind("change:errors", () =>
      this.render()
    )

  save: (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.unset("errors")

    @collection.create(@model.toJSON(),
      success: (shift) =>
        @model = shift
        window.location.hash = "/#{@model.id}"

      error: (shift, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
    )

  render: ->
    $(@el).html(@template(@model.toJSON() ))

    this.$("form").backboneLink(@model)

    return this
