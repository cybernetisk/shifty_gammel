class ShiftsController < ApplicationController
  def index
    @shifts = Shift.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @shifts }
    end
  end

  def take_shift
    @shift = Shift.find(params[:id])
    
    #if params[:confirm]
      @shift.user = User.find(session[:user_id])
      @shift.save
      
      redirect_to @shift
    #end
  end
  
  def new
    @shift = Shift.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @shift }
    end
  end

  def create
    @shift = Shift.new(params[:shift])

    respond_to do |format|
      if @shift.save
        format.html { redirect_to @shift, notice: 'Shift was successfully created.' }
        format.json { render json: @shift, status: :created, location: @shift }
      else
        format.html { render action: 'new' }
        format.json { render json: @shift.errors, status: :unprocessable_entity }
      end
    end
  end

  def edit
    @shift = Shift.find(params[:id])
  end

  def update
    @shift = Shift.find(params[:id])

    respond_to do |format|
      if @shift.update_attributes(params[:shift])
        format.html { redirect_to @shift, notice: 'Shift was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: 'edit' }
        format.json { render json: @shift.errors, satus: :unprocessable_entity }
      end
    end
  end

  def show
    @shift = Shift.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @shift }
    end
  end

  def destroy
    @shift = Shift.find(params[:id])
    @shift.destroy

    respond_to do |format|
      format.html { redirect_to shifts_url }
      format.json { head :ok }
    end
  end
  
  def showAvailable
    @shifts = Shift.getAvailableShifts
    
    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @shift }
    end
  end
  
  def showForDate
    @date = params[:date]
    @shifts = Shift.findForDate(@date)
    
    respond_to do |format|
      format.html 
      format.json { render json: @shift }
    end
  end  
  
  def start
    @upcomingShifts = Shift.getUpcomingShifts
    respond_to do |format|
      format.html 
      format.json { render json: @shift }
    end
  end  
  
  def getAvailableDates
    @availableDates = Shift.getDatesWithAvailableShifts
    respond_to do |format|
      format.html 
      format.json { render json: @availableDates }
    end
  end
  
  def getUnavailableDates
    @availableDates = Shift.getDatesWithNoAvailableShifts
    respond_to do |format|
      format.html 
      format.json { render json: @availableDates }
    end
  end

  def showUpcoming
    @shifts = Shift.getAllUpcomingShifts
    respond_to do |format|
      format.html 
      format.json { render json: @shifts }
    end
  end
  
  def showAll
    @shifts = Shift.getAllUpcomingShifts
    respond_to do |format|
      format.html 
      format.json { render json: @shifts }
    end
  end
  
end
