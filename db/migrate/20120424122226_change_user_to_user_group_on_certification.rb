class ChangeUserToUserGroupOnCertification < ActiveRecord::Migration
  def up
    rename_column :certifications, :user_id, :user_group_id
  end

  def down
    rename_column :certifications, :user_group_id, :user_id
  end
end
