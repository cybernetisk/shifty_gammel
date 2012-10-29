class ShiftsController < ApplicationController
  def calendar
    
    if params[:user_id]
      @user = User.find(params[:user_id])
    end

    if params[:start] and params[:stop]
      if params[:updated]
        params[:updated] = 1.seconds.since DateTime.parse params[:updated]
        @shifts = Shift.where("updated_at > :updated AND ((start >= :start AND start <= :end) or (end >= :start AND end <= :end))", {:start=>params[:start], :end=>params[:stop], :updated=>params[:updated]})

      else

        @shifts = Shift.where("(start >= :start AND start <= :end) or (end >= :start AND end <= :end)", {:start=>params[:start], :end=>params[:stop]})
      end

      if params[:filter] 
        if params[:filter][:shift_type]
          @shifts = @shifts.where("shift_type_id IN (?)", params[:filter][:shift_type])
        end
        if params[:filter][:user_id]
          @shifts = @shifts.where("user_id IN (?)", params[:filter][:user_id])
        end
        if params[:filter][:taken]
          tmp = params[:filter][:taken]
          taken = tmp.index('0') != nil

          if not taken
            @shifts = @shifts.where("user_id IS NULL")
          else
            @shifts = @shifts.where("user_id IS NOT NULL")
          end
        end
      end

      respond_to do |format|
        format.json { render json: @shifts.order('start ASC').to_json(:include=>[:user,:shift_type]) }
      end
      return
    end
    @shifttypes = Hash[*ShiftType.all.map{|x| [x.id, x.title]}.flatten]

    respond_to do |format|
      format.html # index.html.erb
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
    if not current_user.can_manage_shift_type?(@shift.shift_type)
      redirect_to @shift
    end
  end

  def update
    @shift = Shift.find(params[:id])
    if not current_user.can_manage_shift_type?(@shift.shift_type)
      redirect_to @shift
    else
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
  
end
