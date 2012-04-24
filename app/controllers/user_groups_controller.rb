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

    params[:user_group][:shift_type_ids].each do |st_id|
      c = Certification.new(user_group: @user_group, shift_type: ShiftType.find(st_id));
      if not c.save
        errors = true
        @user_group.errors.add(:certification, "Unable to create certification for something}")
      end
    end
    respond_to do |format|
      if errors
        format.html { render action: 'certify' }
        format.json { render json: @user_group.errors, status: :unprocessable_entity }
      else
        format.html { redirect_to @user_group, notice: 'User group was successfully certified!' }
        format.json { head :ok }
      end
    end
  end
end
