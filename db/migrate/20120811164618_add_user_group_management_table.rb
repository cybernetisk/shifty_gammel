class AddUserGroupManagementTable < ActiveRecord::Migration
  def change
    create_table :managed_user_groups, timestamps: false, index: false do |t|
      t.references :manager, null: false
      t.references :group, null: false
    end

    add_index :managed_user_groups, :manager_id
    add_index :managed_user_groups, :group_id
  end
end
