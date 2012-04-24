class UserUserGroupTable < ActiveRecord::Migration
  def change
    create_table :user_groups_users, id: false do |t|
      t.integer :user_id, null: false
      t.integer :user_group_id, null: false
    end
  end
end
