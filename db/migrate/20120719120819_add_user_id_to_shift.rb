class AddUserIdToShift < ActiveRecord::Migration
  def change
    add_column :shifts, :user_id, :integer
  end
end
