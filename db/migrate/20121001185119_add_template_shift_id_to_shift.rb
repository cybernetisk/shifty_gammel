class AddTemplateShiftIdToShift < ActiveRecord::Migration
  def change
    add_column :shifts, :template_shift_id, :integer
  end
end
