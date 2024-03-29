class ShiftsController < ApplicationController
  def calendar
    @shift_types = ShiftType.all
    #@shift_types = Hash[*ShiftType.all.map{|x| [x.id, x.title]}.flatten]

    @templates = Hash[*Template.all.map{|x| [x.id, x.title]}.flatten]
    @templates[-1] = 'None'

    respond_to do |format|
      format.html # index.html.erb
    end
  end

  def list
    @shift_types = Hash[*ShiftType.all.map{|x| [x.id, x.title]}.flatten]

    @templates = Hash[*Template.all.map{|x| [x.id, x.title]}.flatten]
    @templates[-1] = 'None'

    respond_to do |format|
      format.html { render action: 'calendar' }
    end
  end

  def duplicate
    @shift = Shift.find(params[:id])

    @dup = @shift.dup
    @dup.save

    redirect_to @dup
  end

  def take_shift
    @shift = Shift.find(params[:id])

    if @shift.same_as != nil

      respond_to do|format|
        format.html
      end
      
    else
    #if params[:confirm]
      @shift.user = User.find(session[:user_id])
      @shift.save
      
      redirect_to @shift
    end
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
        format.json { render json: @shift.to_json(:include=>[:user,:shift_type]), status: :created, location: @shift }
      else
        format.html { render action: 'new' }
        format.json { render json: @shift.errors, status: :unprocessable_entity }
      end
    end
  end

  def edit
    @shift = Shift.find(params[:id])
    if not verifyEditAccess(@shift) then return end

    render { render :layout => !request.xhr? }
  end

  def update
    @shift = Shift.find(params[:id])
    #if not verifyEditAccess(@shift) then return end

    respond_to do |format|
      if @shift.update_attributes(params[:shift])
        format.html { redirect_to @shift, notice: 'Shift was successfully updated.' }
        format.json { render :json => { :success => :true }, :head => :ok }
      else
        format.html { render action: 'edit', layout: !request.xhr? }
        format.json { render json: @shift.errors, status: :unprocessable_entity }
      end
    end
  end

  def show
    @shift = Shift.find(params[:id])

    respond_to do |format|
      format.html { render :layout => !request.xhr? }
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
  
  def json_index
     if params[:user_id]
      @user = User.find(params[:user_id])
    elsif current_user
      @user = current_user
    end
    @shifts = Shift

    if params[:updated]
      @shifts = @shifts.where("updated_at > :updated", {:updated=>(1.seconds.since DateTime.parse params[:updated])})
    end

    if params[:start]
      start = Time.at(Integer(params[:start]))
      @shifts = @shifts.where("end >= :start", {:start=>start})

      if !params.has_key?:stop and params[:duration]
        params[:stop] = DateTime.parse(params[:start]) + params[:duration].to_f.day
      end
    end

    if params[:stop]
      stop = Time.at(Integer(params[:stop]))
      @shifts = @shifts.where("start <= :stop", {:stop=>stop})
    end

    if params[:shift_type]
      @shifts = @shifts.where("shift_type_id IN (?)", params[:shift_type])
    end
    
    if params[:user]
      @shifts = @shifts.where("user_id IN (?)", params[:user_id])
    end

    if params[:template]
      template_shifts = TemplateShift.where(:template_id=>params[:template]).all(:select=>"id")

      if params[:template].include? "-1"
        @shifts = @shifts.where("template_shift_id IN (?) OR template_shift_id IS NULL", template_shifts)
      else
        @shifts = @shifts.where("template_shift_id IN (?)", template_shifts)
      end
      
    end

    if params[:taken]
      tmp = params[:taken]
      taken = tmp.index('0') != nil

      if not taken
        @shifts = @shifts.where("user_id IS NULL")
      else
        @shifts = @shifts.where("user_id IS NOT NULL")
      end
    end

    render json: @shifts.order('start ASC').to_json(:include=>[:user,:shift_type, :template=>{:include=>[:template]}])
  end

  def index
    @upcomingShifts = Shift.getUpcomingShifts
    if current_user
      @yourshifts = current_user.shifts.where('start > :midnight', {:midnight => Time.now.yesterday.midnight}).limit(10)
    else
      @yourshifts = []
    end
    
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

  def verifyEditAccess(shift)
    if not current_user || current_user.can_manage_shift_type?(shift.shift_type)
      respond_to do |format|
        format.html { redirect_to shift, notice: "You do not have access to edit this shift." }
        format.json { render :json => { :errors => "You do not have access to edit this shift." }, :status => :unauthorized }
      end
      return false
    end
  end
  
end
