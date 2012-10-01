class TemplateShiftsController < ApplicationController
  # GET /template_shifts
  # GET /template_shifts.json
  def index
    @template_shifts = TemplateShift.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @template_shifts }
    end
  end

  # GET /template_shifts/1
  # GET /template_shifts/1.json
  def show
    @template_shift = TemplateShift.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @template_shift }
    end
  end

  # GET /template_shifts/new
  # GET /template_shifts/new.json
  def new
    @template_shift = TemplateShift.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @template_shift }
    end
  end

  # GET /template_shifts/1/edit
  def edit
    @template_shift = TemplateShift.find(params[:id])
  end

  # POST /template_shifts
  # POST /template_shifts.json
  def create
    @template_shift = TemplateShift.new(params[:template_shift])

    respond_to do |format|
      if @template_shift.save
        format.html { redirect_to @template_shift, notice: 'Template shift was successfully created.' }
        format.json { render json: @template_shift, status: :created, location: @template_shift }
      else
        format.html { render action: "new" }
        format.json { render json: @template_shift.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /template_shifts/1
  # PUT /template_shifts/1.json
  def update
    @template_shift = TemplateShift.find(params[:id])

    respond_to do |format|
      if @template_shift.update_attributes(params[:template_shift])
        format.html { redirect_to @template_shift, notice: 'Template shift was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @template_shift.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /template_shifts/1
  # DELETE /template_shifts/1.json
  def destroy
    @template_shift = TemplateShift.find(params[:id])
    @template_shift.destroy

    respond_to do |format|
      format.html { redirect_to template_shifts_url }
      format.json { head :no_content }
    end
  end
end
