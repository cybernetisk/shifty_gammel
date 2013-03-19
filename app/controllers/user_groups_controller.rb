class UserGroupsController < ApplicationController
  def index
    @user_groups = UserGroup.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @user_groups }
    end
  end

  def new
    @user_group = UserGroup.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @user_group }
    end
  end

  def create
    @user_group = UserGroup.new(params[:user_group])

    respond_to do |format|
      if @user_group.save
        format.html { redirect_to @user_group, notice: 'User group was successfully created.' }
        format.json { render json: @user_group, status: :created, location: @user }
      else
        format.html { render action: 'new' }
        format.json { render json: @user_group.errors, status: :unprocessable_entity }
      end
    end
  end

  def edit
    @user_group = UserGroup.find(params[:id])
  end

  def update
    @user_group = UserGroup.find(params[:id])

    respond_to do |format|
      if @user_group.update_attributes(params[:user_group])
        format.html { redirect_to @user_group, notice: 'User group was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: 'edit' }
        format.json { render json: @user_group.errors, status: :unprocessable_entity }
      end
    end
  end

  def show
    @user_group = UserGroup.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @user_group }
    end
  end

  def destroy
    @user_group = UserGroup.find(params[:id])
    @user_group.destroy

    respond_to do |format|
      format.html { redirect_to user_groups_url }
      format.json { head :ok }
    end
  end

  def certify
    @user_group = UserGroup.find(params[:id])
  end

  def update_certifications
    @user_group = UserGroup.find(params[:id])
    @user_group.certifications.destroy_all

    errors = false

    ShiftType.all.each do |type|
      type_id = type.id.to_s
      can_manage = params.include?(:user_group_manage) && params[:user_group_manage].include?(type_id)
      type_checked = params.has_key?(:user_group) && params[:user_group].include?(type_id)
      if type_checked || can_manage
        c = Certification.new(user_group: @user_group, shift_type: ShiftType.find(type.id), manager:can_manage);
        if not c.save
          error = true
          @user_group.error.add(:certification, "Unable to create certification for something")
        end
      end
    end

    respond_to do |format|
      if errors
        format.html { render action: 'certify' }
        format.json { render json: @user_group.errors, status: :unprocessable_entity }
      else
        format.html { render action: 'certify' }
        format.json { head :ok }
      end
    end
  end

  def add_certification
    @user_group = UserGroup.find(params[:id])
    shift_type = ShiftType.find(params[:shift_type])

    success = @user_group.certify_for_shift_type shift_type

    if success
      flash[:notice] = "#{@user_group.name} is now certified for #{shift_type.title}"
    else
      flash[:notice] = "#{@user_group.name} is already certified for #{shift_type.title}"
    end

    redirect_to @user_group
  end

  def remove_certification
    @user_group = UserGroup.find(params[:id])
    shift_type = ShiftType.find(params[:shift_type])

    success = @user_group.remove_certification_for_shift_type shift_type

    if success
      flash[:notice] = "#{@user_group.name} is no longer certified for #{shift_type.title}"
    else
      flash[:notice] = "Something went wrong when removing #{@user_group.name}'s certification for #{shift_type.title}"
    end

    redirect_to @user_group
  end

  def adduser
    @group = UserGroup.find(params[:id])

    @users = User.select("id not in :usergroup", @group.users)
    
    
  end


  def add_user
    @group = UserGroup.find(params[:id])
    user = User.find(params[:user])

    success = @group.add_user user

    if success
      flash[:notice] = "#{user.username} was added to #{@group.name}"
    else
      flash[:notice] = "#{user.username} was already in #{@group.name}"
    end

    redirect_to @group
  end

  def remove_user
    @group = UserGroup.find(params[:id])
    user = User.find(params[:user])

    success = @group.remove_user user

    if success
      flash[:notice] = "#{user.username} was removed from #{@group.name}"
    else
      flash[:notice] = "#{user.username} was not removed from #{@group.name}"
    end
    
    redirect_to @group
  end
end
