class RemoveCertificationIdFromShift < ActiveRecord::Migration
  def up
    remove_column :shifts, :certification_id
  end

  def down
    add_column :shifts, :certification_id, null: true
  end
end
