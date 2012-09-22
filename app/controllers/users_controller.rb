class UsersController < ApplicationController
  def index
    @users = User.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @users }
    end
  end

  def new
    @user = User.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @user }
    end
  end

  def create
    @user = User.new(params[:user])

    respond_to do |format|
      if @user.save
        format.html { redirect_to @user, notice: 'User was successfully created.' }
        format.json { render json: @user, status: :created, location: @user }
      else
        format.html { render action: 'new' }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end

  def edit
    @user = User.find(params[:id])
  end

  def update
    @user = User.find(params[:id])

    respond_to do |format|
      if @user.update_attributes(params[:user])
        format.html { redirect_to @user, notice: 'User was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: 'edit' }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end

  def show
    @user = User.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @user }
    end
  end

  def destroy
    @user = User.find(params[:id])
    @user.destroy

    respond_to do |format|
      format.html { redirect_to users_url }
      format.json { head :ok }
    end
  end

    def groups
    @user = User.find(params[:id])
  end

  def add_group
    @user = User.find(params[:id])
    group = UserGroup.find(params[:user_group])
    success = @user.add_to_group group

    if success
      flash[:notice] = "#{@user.username} added to #{group.name}"
    else
      flash[:notice] = "#{@user.username} is already in #{group.name}"
    end
    redirect_to @user
  end

  def remove_group
    @user = User.find(params[:id])
    group = UserGroup.find(params[:user_group])

    success = @user.remove_from_group group
    if success
      flash[:notice] = "#{@user.username} was removed from #{group.name}"
    else
      flash[:notice] = "#{@user.username} was not removed from #{group.name}"
    end
    redirect_to @user
  end

  def update_groups
    @user = User.find(params[:id])
    @user.user_groups.destroy_all

    params[:user][:user_group_ids].each do |ug_id|
      @user.user_groups << UserGroup.find(ug_id)
    end

    respond_to do |format|
      format.html { redirect_to @user, notice: 'User group was successfully certified!' }
      format.json { head :ok }
    end
  end

  def find
    @users = User.where("LOWER(username) LIKE ?", "#{params[:query]}%")
    render json: @users
  end

  def shifts
    if params.has_key?(:id)
      @user = User.find(params[:id])

      @shift = @user.shifts.where(:start => DateTime.now)
    end
    render html: {user:@user}
  end

  def ticket
    
    if params.has_key?(:id)
      @user = User.find(params[:id])
      
      sum = params[:withdraw].to_f
      if sum > 0 && sum <= @user.tickets_sum
        if @user.withdraw(sum)
          flash[:notice] = "Withdraw successful"
        else
          flash[:notice] = "Withdraw failed"
        end
      else
        flash[:notice] = "Not enough tickets"
      end
      
      @can_withdraw = true
    else
      @user = User.find(session[:user_id])
      @can_withdraw = false
    end
    
    

    render html: {user:@user}
  end
  
  def admin
    
  end
end
