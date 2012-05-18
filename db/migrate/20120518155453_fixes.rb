class Fixes < ActiveRecord::Migration
  def change
    rename_column :shifts, :user_id, :task_id
    rename_column :tickets, :shift_id, :task_id
  end
  def up
  end

  def down
  end
end
