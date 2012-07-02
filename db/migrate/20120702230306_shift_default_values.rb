class ShiftDefaultValues < ActiveRecord::Migration
  def up
    change_column :shifts, :leasing, :boolean, :default=>0
    change_column :shifts, :training, :boolean, :default=>0
    change_column :shifts, :comment, :text, :null=>true
  end

  def down
    raise ActiveRecord::IrreversibleMigration, "Can't remove the default"
  end
end
