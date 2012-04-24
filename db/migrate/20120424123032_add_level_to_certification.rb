class AddLevelToCertification < ActiveRecord::Migration
  def change
    add_column :certifications, :user, :boolean, default: 'f'
    add_column :certifications, :manager, :boolean, default: 'f'
  end
end
