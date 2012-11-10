class TemplatesController < ApplicationController
  # GET /templates
  # GET /templates.json
  def index
    @templates = Template.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @templates }
    end
  end

  # GET /templates/1
  # GET /templates/1.json
  def show
    @template = Template.find(params[:id])
    
    @shift_types = @template.template_shift.select(:shift_type_id).uniq

    @count = Hash.new

    @shift_types.each do |x|
      @count[x] = @template.template_shift.where(:shift_type_id=>x).count
    end

    @shifts = @template.template_shift.order("shift_type_id, start ASC")

    @rows = []

    currentRow = []
    laststart = nil
    @shifts.each do |shift|
      if laststart == nil 
        laststart = shift.start
      end
      if shift.start > laststart
        laststart = shift.start
        @rows << currentRow
        currentRow = []
      end
      currentRow << shift
    end
    @rows << currentRow

    #@queries = @template.count_intervals.times.map do | i | Shift.where(:start => @template.get_period(i), :template_shift_id=> @template.template_shift) end


    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @template }
    end
  end

  # GET /templates/new
  # GET /templates/new.json
  def new
    @template = Template.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @template }
    end
  end

  # GET /templates/1/edit
  def edit
    @template = Template.find(params[:id])
  end

  # POST /templates
  # POST /templates.json
  def create
    @template = Template.new(params[:template])

    respond_to do |format|
      if @template.save
        format.html { redirect_to @template, notice: 'Template was successfully created.' }
        format.json { render json: @template, status: :created, location: @template }
      else
        format.html { render action: "new" }
        format.json { render json: @template.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /templates/1
  # PUT /templates/1.json
  def update
    @template = Template.find(params[:id])

    respond_to do |format|
      if @template.update_attributes(params[:template])
        format.html { redirect_to @template, notice: 'Template was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @template.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /templates/1
  # DELETE /templates/1.json
  def destroy
    @template = Template.find(params[:id])
    @template.destroy

    respond_to do |format|
      format.html { redirect_to templates_url }
      format.json { head :no_content }
    end
  end
  
  def shifts
      @template = Template.find(1)
      @shifts = TemplateShift.where("template_id=1")
      if params[:start] and params[:stop]
        respond_to do |format|
        format.json { render json: @shifts.to_json(:include=>[:shift_type]) }
      end
      return
    end
  end  
end
