class ShiftTypesController < ApplicationController
  def new
    @shift_type = ShiftType.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @shift_type }
    end
  end

  def create
    @shift_type = ShiftType.new(params[:shift_type])

    respond_to do |format|
      if @shift_type.save
        format.html { redirect_to @shift_type, notice: 'ShiftType was successfully created.' }
        format.json { render json: @shift_type, status: :created, location: @shift_type }
      else
        format.html { render action: "new" }
        format.json { render json: @shift_type.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    @shift_type = ShiftType.find(params[:id])

    respond_to do |format|
      if @shift_type.update_attributes(params[:shift_type])
        format.html { redirect_to @shift_type, notice: 'Shift type was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @shift_type.errors, status: :unprocessable_entity }
      end
    end
  end

  def edit
    @shift_type = ShiftType.find(params[:id])
  end

  def destroy
    @shift_type = ShiftType.find(params[:id])
    @shift_type.destroy
    
    respond_to do |format|
      format.html { redirect_to shift_types_url }
      format.json { head :ok }
    end
  end

  def index
    @shift_types = ShiftType.all
    
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @shift_types }
  end
  end

  def show
    @shift_type = ShiftType.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @shift_type }
    end
  end
end
