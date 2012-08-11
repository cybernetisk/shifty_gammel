class UserGroup < ActiveRecord::Base
  attr_accessible :name
  has_and_belongs_to_many :users
  has_and_belongs_to_many :user_groups, join_table: :managed_user_groups, as: :managed_groups, foreign_key: "manager_id", association_foreign_key: "group_id"
  has_many :certifications

  def add_user(user)
    if self.users.include? user or not (user.is_a? User)
      return false
    else
      self.users << user
      return true
    end
  end

  def remove_user(user)
    if self.users.include? user and user.is_a? User
      self.users.delete user
      return true
    else
      return false
    end
  end

  def certify_for_shift_type(shift_type)
    if Certification.where(shift_type_id: shift_type, user_group_id: self).exists?
      return false
    else
      c = Certification.new(shift_type: shift_type, user_group: self)
      c.save
    end
  end

  def remove_certification_for_shift_type(shift_type)
    Certification.where(shift_type_id: shift_type, user_group_id: self).delete_all
  end
end
