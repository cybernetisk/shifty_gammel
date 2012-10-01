class AddTemplateIdToTemplateShift < ActiveRecord::Migration
  def change
    add_column :template_shifts, :template_id, :integer
  end
end
